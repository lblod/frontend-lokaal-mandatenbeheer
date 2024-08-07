import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { task, restartableTask } from 'ember-concurrency';

export default class GenerateRowsFormComponent extends Component {
  @service store;

  @tracked mandaatOptions;
  @tracked selectedMandaat;

  constructor() {
    super(...arguments);

    this.initForm.perform();
  }

  initForm = task(async () => {
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

  onConfigReady = restartableTask(async () => {
    this.args.onConfigReceived({
      rows: 0,
      startDate: null,
    });
  });
}
