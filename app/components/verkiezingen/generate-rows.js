import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { task } from 'ember-concurrency';

import {
  getDraftPublicationStatus,
  getEffectiefStatus,
} from 'frontend-lmb/utils/get-mandataris-status';
import { rangordeNumberMapping } from 'frontend-lmb/utils/rangorde';

export default class GenerateRowsFormComponent extends Component {
  @service store;

  effectiefStatus;
  draftPublicationStatus;

  @tracked startDate;
  @tracked endDate;
  @tracked mandaatOptions;
  @tracked loadingMessageOfGeneration;

  constructor() {
    super(...arguments);

    this.initForm.perform();
  }

  initForm = task(async () => {
    this.effectiefStatus = await getEffectiefStatus(this.store);
    this.draftPublicationStatus = await getDraftPublicationStatus(this.store);
    this.startDate = new Date(this.args.bestuursorgaan.bindingStart);
    this.endDate = new Date(this.args.bestuursorgaan.bindingEinde);
    const mandaten = await this.args.bestuursorgaan.bevat;
    this.mandaatOptions = await Promise.all(
      mandaten.map(async (mandaat) => {
        const bestuursfunctie = await mandaat.bestuursfunctie;

        return {
          parent: mandaat,
          label: bestuursfunctie.label,
        };
      })
    );
  });

  generateMandatarissen = task(async (config) => {
    const addedMandatarissen = [];
    const { rows, mandaat, startDate, endDate, existingMandaten } = config;
    const mandatarisProps = {
      rangorde: null,
      start: startDate,
      einde: endDate,
      bekleedt: mandaat,
      isBestuurlijkeAliasVan: null,
      beleidsdomein: [],
      status: this.effectiefStatus,
      publicationStatus: this.draftPublicationStatus,
    };

    for (let index = 0; index < rows; index++) {
      if (mandaat.isSchepen) {
        const rangordeAsNumber = existingMandaten + index + 1;
        mandatarisProps.rangorde = `${rangordeNumberMapping[rangordeAsNumber] ?? 'Eerste'} schepen`;
      }
      if (mandaat.isGemeenteraadslid) {
        const rangordeAsNumber = existingMandaten + index + 1;
        mandatarisProps.rangorde = `${rangordeNumberMapping[rangordeAsNumber] ?? 'Eerste'} lid`;
      }

      const mandataris = this.store.createRecord('mandataris', mandatarisProps);
      await mandataris.save();
      addedMandatarissen.push(mandataris);
      this.loadingMessageOfGeneration = `Generating ${index + 1} of ${rows}`;
    }
    this.loadingMessageOfGeneration = null;
    this.args.onCreated({
      added: addedMandatarissen,
    });
    this.args.onCancel();
  });
}
