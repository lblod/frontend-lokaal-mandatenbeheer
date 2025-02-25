import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { task } from 'ember-concurrency';

export default class GenerateRowsFormComponent extends Component {
  @service store;
  @service('mandataris-api') mandatarisApi;

  @tracked startDate;
  @tracked endDate;
  @tracked mandaatOptions;

  constructor() {
    super(...arguments);

    this.initForm.perform();
  }

  initForm = task(async () => {
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
    await this.mandatarisApi.generateRows(config);
    this.args.onCreated({
      updated: true,
    });
    this.args.onCancel();
  });

  get loadingMessage() {
    if (this.generateMandatarissen.isRunning) {
      return 'Genereren';
    }

    return null;
  }
}
