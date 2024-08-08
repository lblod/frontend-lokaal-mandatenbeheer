import Component from '@glimmer/component';

import { task } from 'ember-concurrency';
import { service } from '@ember/service';

import {
  getDraftPublicationStatus,
  getEffectiefStatus,
} from 'frontend-lmb/utils/get-mandataris-status';
import { rangordeNumberMapping } from 'frontend-lmb/utils/rangorde';

export default class GenerateRowsFormComponent extends Component {
  @service store;

  effectiefStatus;
  draftPublicationStatus;

  constructor() {
    super(...arguments);

    this.backgroundInit.perform();
  }

  backgroundInit = task(async () => {
    this.effectiefStatus = await getEffectiefStatus(this.store);
    this.draftPublicationStatus = await getDraftPublicationStatus(this.store);
  });

  generateMandatarissen = task(async (config) => {
    const { rows, mandaat } = config;
    const mandatarisProps = {
      rangorde: null,
      start: new Date(this.args.bestuursorgaan.bindingStart),
      einde: new Date(this.args.bestuursorgaan.bindingEinde),
      bekleedt: mandaat,
      isBestuurlijkeAliasVan: null,
      beleidsdomein: [],
      status: this.effectiefStatus,
      publicationStatus: this.publicationStatus,
    };

    for (let index = 0; index < rows; index++) {
      if (mandaat.isSchepen) {
        const rangordeAsNumber = index + 1;
        mandatarisProps.rangorde = `${rangordeNumberMapping[rangordeAsNumber] ?? 'Eerste'} schepenen`;
      }

      const mandataris = this.store.createRecord('mandataris', mandatarisProps);
      await mandataris.save();
    }
  });
}
