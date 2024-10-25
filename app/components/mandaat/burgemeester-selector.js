import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { restartableTask } from 'ember-concurrency';
import {
  getDraftPublicationStatus,
  getEffectiefStatus,
} from 'frontend-lmb/utils/get-mandataris-status';
import {
  BESTUURSFUNCTIE_AANGEWEZEN_BURGEMEESTER_ID,
  BESTUURSFUNCTIE_VOORZITTER_VAST_BUREAU_ID,
} from 'frontend-lmb/utils/well-known-ids';
import moment from 'moment';

export default class MandaatBurgemeesterSelectorComponent extends Component {
  @service store;
  @service bcsd;
  @service('mandataris') mandatarisService;

  @tracked persoon = null;
  @tracked aangewezenBurgemeesters;
  @tracked isPersonSelectOpen;
  @tracked selectedFractie = null;

  // no need to track these
  burgemeesterMandate = null;
  voorzitterVastBureauMandate = null;
  targetMandatarisses = null;

  get bindingStart() {
    return this.args.bestuursorgaanInTijd.bindingStart;
  }

  get bindingEinde() {
    return this.args.bestuursorgaanInTijd.bindingEinde;
  }

  get disabled() {
    return !this.persoon || !this.selectedFractie;
  }

  constructor() {
    super(...arguments);
    this.setup.perform();
  }

  setup = restartableTask(async () => {
    await this.loadBurgemeesterMandates();

    if (this.burgemeesterMandate && this.voorzitterVastBureauMandate) {
      this.persoon = await this.loadBurgemeesterPersoon();
      this.aangewezenBurgemeesters = this.persoon ? [this.persoon] : null;
    }
  });

  formatToDateString(dateTime) {
    return dateTime ? moment(dateTime).format('YYYY-MM-DD') : undefined;
  }

  async loadBurgemeesterMandates() {
    const mandates = await this.store.query('mandaat', {
      filter: {
        'bevat-in': {
          'heeft-bestuursperiode': {
            id: this.args.bestuursperiode.id,
          },
        },
        bestuursfunctie: {
          id: [
            BESTUURSFUNCTIE_AANGEWEZEN_BURGEMEESTER_ID,
            BESTUURSFUNCTIE_VOORZITTER_VAST_BUREAU_ID,
          ].join(','),
        },
      },
      include: 'bestuursfunctie',
    });
    this.burgemeesterMandate = mandates.find((m) => {
      return (
        m.get('bestuursfunctie.id') ===
        BESTUURSFUNCTIE_AANGEWEZEN_BURGEMEESTER_ID
      );
    });
    this.voorzitterVastBureauMandate = mandates.find((m) => {
      return (
        m.get('bestuursfunctie.id') ===
        BESTUURSFUNCTIE_VOORZITTER_VAST_BUREAU_ID
      );
    });
  }

  async createMandataris(burgemeesterMandaat) {
    const newMandataris = this.store.createRecord('mandataris', {
      rangorde: null,
      start: this.bindingStart,
      einde: this.bindingEinde,
      bekleedt: burgemeesterMandaat,
      isBestuurlijkeAliasVan: null,
      beleidsdomein: [],
      status: await getEffectiefStatus(this.store),
      publicationStatus: await getDraftPublicationStatus(this.store),
    });
    await newMandataris.save();
    return newMandataris;
  }

  async loadBurgemeesterPersoon() {
    const burgemeesters = await this.burgemeesterMandate.bekleedDoor.reload();
    const voorzitterVastBureau =
      await this.voorzitterVastBureauMandate.bekleedDoor.reload();

    const targetMandatarisses = [];

    if (burgemeesters.length === 0) {
      targetMandatarisses.push(
        await this.createMandataris(this.burgemeesterMandate)
      );
    } else {
      targetMandatarisses.push(burgemeesters[0]);
    }
    if (voorzitterVastBureau.length === 0) {
      targetMandatarisses.push(
        await this.createMandataris(this.voorzitterVastBureauMandate)
      );
    } else if (voorzitterVastBureau.length === 1) {
      targetMandatarisses.push(voorzitterVastBureau[0]);
    }

    this.targetMandatarisses = targetMandatarisses;

    return burgemeesters[0]?.isBestuurlijkeAliasVan || null;
  }

  updateBurgemeester = restartableTask(async () => {
    const tmpPerson = this.persoon;
    // TODO Setup overwrites person, why do we need this?
    await this.setup.perform();
    this.persoon = tmpPerson;
    if (!this.targetMandatarisses) {
      return;
    }
    await Promise.all(
      this.targetMandatarisses.map(async (target) => {
        target.isBestuurlijkeAliasVan = this.persoon;
        if (this.selectedFractie) {
          await this.mandatarisService.createNewLidmaatschap(
            target,
            this.selectedFractie
          );
        } else {
          await this.mandatarisService.destroyLidmaatschap(target);
        }
        return target.save();
      })
    );
    this.setup.perform();
    this.bcsd.forceRecomputeBCSD();
    if (this.args.onUpdateBurgemeester) {
      this.args.onUpdateBurgemeester();
    }

    this.closeModal();
  });

  @action
  closeModal() {
    this.persoon = null;
    this.selectedFractie = null;
    this.isPersonSelectOpen = false;
  }

  @action
  async selectPerson(newPerson) {
    this.persoon = newPerson;
  }

  @action updateFractie(newFractie) {
    this.selectedFractie = newFractie;
  }

  @action
  async removeBurgemeester() {
    this.persoon = null;
    this.selectedFractie = null;
    this.aangewezenBurgemeesters = [];
    await this.updateBurgemeester.perform();
    // TODO Fractie needs to be removed here as well from the mandatees ...
  }

  get toolTipText() {
    return this.persoon ? 'Er is reeds een burgemeester geselecteerd.' : '';
  }
}
