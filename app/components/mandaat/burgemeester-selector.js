import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { restartableTask } from 'ember-concurrency';
import { getFormFrom } from 'frontend-lmb/utils/get-form';
import {
  getDraftPublicationStatus,
  getEffectiefStatus,
} from 'frontend-lmb/utils/get-mandataris-status';
import {
  BESTUURSFUNCTIE_AANGEWEZEN_BURGEMEESTER_ID,
  BESTUURSFUNCTIE_VOORZITTER_VAST_BUREAU_ID,
  CREATE_PERSON_FORM_ID,
} from 'frontend-lmb/utils/well-known-ids';
import moment from 'moment';

export default class MandaatBurgemeesterSelectorComponent extends Component {
  @service store;
  @service bcsd;

  @tracked persoon = null;
  @tracked mandataris = null;
  @tracked aangewezenBurgemeesters;
  @tracked isPersonSelectOpen;
  @tracked isCreatingPerson;
  @tracked createPersonFormDefinition;
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

    this.closeModal();
  });

  formatToDateString(dateTime) {
    return dateTime ? moment(dateTime).format('YYYY-MM-DD') : undefined;
  }

  async loadBurgemeesterMandates() {
    const bestuursperiode =
      await this.args.bestuursorgaanInTijd.heeftBestuursperiode;
    const mandates = await this.store.query('mandaat', {
      filter: {
        'bevat-in': {
          'heeft-bestuursperiode': {
            id: bestuursperiode.id,
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
    const burgemeesters = await this.burgemeesterMandate.bekleedDoor;
    const voorzitterVastBureau =
      await this.voorzitterVastBureauMandate.bekleedDoor;

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

  onUpdate = restartableTask(async (persoon) => {
    this.persoon = persoon;
    if (!this.targetMandatarisses) {
      return;
    }
    await Promise.all(
      this.targetMandatarisses.map((target) => {
        target.isBestuurlijkeAliasVan = persoon;
        return target.save();
      })
    );
    this.setup.perform();
    this.bcsd.forceRecomputeBCSD();
    if (this.args.onUpdateBurgemeester) {
      this.args.onUpdateBurgemeester();
    }
  });

  @action
  closeModal() {
    this.isCreatingPerson = false;
    this.isPersonSelectOpen = false;
  }

  @action
  async onCreateNewPerson() {
    this.createPersonFormDefinition = await getFormFrom(
      this.store,
      CREATE_PERSON_FORM_ID
    );
    this.isCreatingPerson = true;
  }

  @action
  async onSelectNewPerson({ instanceId }) {
    this.persoon = await this.store.findRecord('persoon', instanceId);
    await this.onUpdate.perform(this.persoon);
  }

  @action
  async removeBurgemeester() {
    this.persoon = null;
    this.aangewezenBurgemeesters = [];
    await this.onUpdate.perform(this.persoon);
  }

  get toolTipText() {
    return 'Er is reeds een burgemeester geselecteerd.';
  }
}
