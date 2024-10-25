import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import {
  getDraftPublicationStatus,
  getEffectiefStatus,
} from 'frontend-lmb/utils/get-mandataris-status';
import {
  BESTUURSFUNCTIE_AANGEWEZEN_BURGEMEESTER_ID,
  BESTUURSFUNCTIE_VOORZITTER_VAST_BUREAU_ID,
} from 'frontend-lmb/utils/well-known-ids';

export default class MandaatBurgemeesterSelectorComponent extends Component {
  @service store;
  @service bcsd;
  @service('mandataris') mandatarisService;

  @tracked persoon = null;
  @tracked aangewezenBurgemeesters;
  @tracked isModalOpen;
  @tracked selectedFractie = null;

  // no need to track these
  burgemeesterMandate = null;
  voorzitterVastBureauMandate = null;
  targetMandatarisses = null;

  get disabled() {
    return !this.persoon || !this.selectedFractie;
  }

  constructor() {
    super(...arguments);
    this.setup();
  }

  @action async setup() {
    await this.loadBurgemeesterMandates();
    await this.loadBurgemeesterMandatarissen();
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
      start: this.args.bestuursorgaanInTijd.bindingStart,
      einde: this.args.bestuursorgaanInTijd.bindingEinde,
      bekleedt: burgemeesterMandaat,
      isBestuurlijkeAliasVan: null,
      beleidsdomein: [],
      status: await getEffectiefStatus(this.store),
      publicationStatus: await getDraftPublicationStatus(this.store),
    });
    await newMandataris.save();
    return newMandataris;
  }

  async loadBurgemeesterMandatarissen() {
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

    // TODO should become mandataris instead of person...
    this.aangewezenBurgemeesters = burgemeesters[0]?.isBestuurlijkeAliasVan
      ? [burgemeesters[0]?.isBestuurlijkeAliasVan]
      : [];
  }

  @action
  async updateBurgemeester() {
    await this.loadBurgemeesterMandatarissen();
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

    // TODO should become mandataris
    this.aangewezenBurgemeesters.push(this.persoon);

    this.bcsd.forceRecomputeBCSD();
    if (this.args.onUpdateBurgemeester) {
      this.args.onUpdateBurgemeester();
    }

    this.closeModal();
  }

  @action
  closeModal() {
    this.isModalOpen = false;
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
    await this.updateBurgemeester();
  }

  get toolTipText() {
    return this.persoon ? 'Er is reeds een burgemeester geselecteerd.' : '';
  }
}
