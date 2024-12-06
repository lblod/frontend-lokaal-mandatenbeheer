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
  @service installatievergadering;
  @service('mandataris') mandatarisService;

  @tracked persoon = null;
  @tracked aangewezenBurgemeesters;
  @tracked aangewezenBurgemeester;
  @tracked isModalOpen;
  @tracked selectedFractie = null;
  @tracked selectedBeleidsdomeinen = [];
  @tracked date;

  // no need to track these
  burgemeesterMandate = null;
  voorzitterVastBureauMandate = null;
  targetMandatarisses = null;

  get disabled() {
    return !this.persoon || !this.selectedFractie;
  }
  get bestuursorgaanStart() {
    return this.args.bestuursorgaanInTijd.bindingStart;
  }

  get bestuursorgaanEinde() {
    return this.args.bestuursorgaanInTijd.bindingEinde;
  }

  constructor() {
    super(...arguments);
    this.setup();
  }

  @action async setup() {
    this.date = this.args.bestuursorgaanInTijd.bindingStart;
    await this.loadBurgemeesterMandates();
    await this.loadBurgemeesterMandatarissen();
    await this.loadBurgemeesterPerson();
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
      start: this.date,
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
    const burgemeesters = await this.burgemeesterMandate.bekleedDoor;
    const voorzitterVastBureau =
      await this.voorzitterVastBureauMandate.bekleedDoor;

    const targetMandatarisses = [];

    if (burgemeesters.length === 0) {
      this.aangewezenBurgemeester = await this.createMandataris(
        this.burgemeesterMandate
      );
      targetMandatarisses.push(this.aangewezenBurgemeester);
    } else {
      this.aangewezenBurgemeester = burgemeesters[0];
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
  }

  async loadBurgemeesterPerson() {
    if (await this.aangewezenBurgemeester.isBestuurlijkeAliasVan) {
      this.aangewezenBurgemeesters = [this.aangewezenBurgemeester];
      this.persoon = this.aangewezenBurgemeester.isBestuurlijkeAliasVan;
    } else {
      this.aangewezenBurgemeesters = [];
    }
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
        if (await target.bekleedt.get('isBurgemeester')) {
          target.beleidsdomein = this.selectedBeleidsdomeinen;
        }
        return target.save();
      })
    );

    this.aangewezenBurgemeesters = this.persoon
      ? [this.aangewezenBurgemeester]
      : [];

    this.installatievergadering.forceRecomputeBCSD();
    if (this.args.onUpdateBurgemeester) {
      this.args.onUpdateBurgemeester();
    }

    this.isModalOpen = false;
  }

  @action
  closeModal() {
    this.isModalOpen = false;
    this.persoon = null;
    this.selectedFractie = null;
    this.selectedBeleidsdomeinen = [];
  }

  @action
  async selectPerson(newPerson) {
    this.persoon = newPerson;
  }

  @action updateFractie(newFractie) {
    this.selectedFractie = newFractie;
  }

  @action selectBeleidsdomeinen(domeinen) {
    this.selectedBeleidsdomeinen = domeinen;
  }

  @action
  async removeBurgemeester() {
    this.persoon = null;
    this.selectedFractie = null;
    this.selectedBeleidsdomeinen = [];
    this.aangewezenBurgemeesters = [];
    await this.updateBurgemeester();
  }

  get toolTipText() {
    return this.persoon ? 'Er is reeds een burgemeester geselecteerd.' : '';
  }
}
