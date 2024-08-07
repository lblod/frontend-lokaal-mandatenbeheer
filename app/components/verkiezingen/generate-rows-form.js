import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { task, restartableTask, timeout } from 'ember-concurrency';
import { INPUT_DEBOUNCE } from 'frontend-lmb/utils/constants';

export default class GenerateRowsFormComponent extends Component {
  @service store;

  @tracked mandaatOptions;
  @tracked selectedMandaat;
  @tracked rowsToGenerate;

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

  validateRows = restartableTask(async (event) => {
    await timeout(INPUT_DEBOUNCE);
    const inputValue = parseInt(event.target?.value);
    if (isNaN(inputValue)) {
      this.rowsToGenerate = null;
      this.rowsError = 'Geef een positief getal in.';
      return;
    }

    this.rowsToGenerate = inputValue;
    console.log(`rowsToGenerate:`, this.rowsToGenerate);
  });

  onConfigReady = restartableTask(async () => {
    this.args.onConfigReceived({
      rows: this.rowsToGenerate,
      mandaat: this.selectedMandaat.parent,
    });
  });

  get isInvaldForGeneration() {
    return !this.selectedMandaat || this.rowsToGenerate <= 0;
  }
}
