import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import moment from 'moment';
import {
  getDraftPublicationStatus,
  getEffectiefStatus,
} from 'frontend-lmb/utils/get-mandataris-status';
import {
  BESTUURSFUNCTIE_BURGEMEESTER_ID,
  BESTUURSFUNCTIE_VOORZITTER_VAST_BUREAU_ID,
  CREATE_PERSON_FORM_ID,
} from 'frontend-lmb/utils/well-known-ids';
import { toUserReadableListing } from 'frontend-lmb/utils/to-user-readable-listing';
import { restartableTask } from 'ember-concurrency';
import { getFormFrom } from 'frontend-lmb/utils/get-form';

export default class MandaatBurgemeesterSelectorComponent extends Component {
  @service store;

  @tracked persoon = null;
  @tracked mandataris = null;
  @tracked errorMessages = [];
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
      this.aangewezenBurgemeesters = [this.persoon];
    }
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
            BESTUURSFUNCTIE_BURGEMEESTER_ID,
            BESTUURSFUNCTIE_VOORZITTER_VAST_BUREAU_ID,
          ].join(','),
        },
      },
      include: 'bestuursfunctie',
    });
    this.burgemeesterMandate = mandates.find((m) => {
      return m.get('bestuursfunctie.id') === BESTUURSFUNCTIE_BURGEMEESTER_ID;
    });
    this.voorzitterVastBureauMandate = mandates.find((m) => {
      return (
        m.get('bestuursfunctie.id') ===
        BESTUURSFUNCTIE_VOORZITTER_VAST_BUREAU_ID
      );
    });
  }

  async setMultipleBurgemeestersError(burgemeesters) {
    const personen = await Promise.all(
      burgemeesters.map((b) => b.isBestuurlijkeAliasVan)
    );
    const mandaatName = burgemeesters[0].get('bekleedt.bestuursfunctie.label');

    this.errorMessages = [
      ...this.errorMessages,
      `Er zijn meerdere personen gevonden met het mandaat ${mandaatName}. Enkel de eerste zal aangepast worden:
      ${toUserReadableListing(personen, (p) => `${p.gebruikteVoornaam} ${p.achternaam}`)}.`,
    ];
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
    } else if (burgemeesters.length === 1) {
      targetMandatarisses.push(burgemeesters[0]);
    } else {
      await this.setMultipleBurgemeestersError(burgemeesters);
      targetMandatarisses.push(burgemeesters[0]);
    }
    if (voorzitterVastBureau.length === 0) {
      targetMandatarisses.push(
        await this.createMandataris(this.voorzitterVastBureauMandate)
      );
    } else if (voorzitterVastBureau.length === 1) {
      targetMandatarisses.push(voorzitterVastBureau[0]);
    } else {
      await this.setMultipleBurgemeestersError(voorzitterVastBureau);
      targetMandatarisses.push(voorzitterVastBureau[0]);
    }

    this.targetMandatarisses = targetMandatarisses;

    return burgemeesters[0]?.isBestuurlijkeAliasVan || null;
  }

  @action
  async onUpdate(persoon) {
    this.persoon = await this.store.findRecord('persoon', this.persoon.id);

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
    this.isPersonSelectOpen = false;
  }

  @action
  toggleSelectPersonModal() {
    this.isPersonSelectOpen = !this.isPersonSelectOpen;
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
    this.setup.perform();
    this.isCreatingPerson = false;
    this.isPersonSelectOpen = false;
  }
}
