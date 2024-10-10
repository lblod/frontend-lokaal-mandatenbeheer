import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { A } from '@ember/array';

import { task, restartableTask, timeout } from 'ember-concurrency';

import { INPUT_DEBOUNCE } from 'frontend-lmb/utils/constants';

export default class GenerateRowsFormComponent extends Component {
  @service store;

  @tracked selectedMandaat;
  @tracked startDate;
  @tracked endDate;
  @tracked rowsToGenerate;
  @tracked rowWarnings = A([]);
  @tracked lengthExistingMandaten = 0;
  @tracked rowsToCreateHelpText;

  constructor() {
    super(...arguments);
    this.startDate = this.args.startDate;
    this.endDate = this.args.endDate;
  }

  @action
  async selectMandaat(mandaatOption) {
    this.selectedMandaat = mandaatOption;
    await this.checkPossibleMandatenToGenerate.perform();
  }

  checkPossibleMandatenToGenerate = restartableTask(async () => {
    this.rowWarnings.clear();
    this.lengthExistingMandaten = (
      await this.store.query('mandataris', {
        page: {
          size: 9999,
        },
        'filter[bekleedt][:id:]': this.selectedMandaat.parent.id,
        'filter[bekleedt][bevat-in][:id:]': this.args.bestuursorgaan.id,
      })
    ).length;

    if (
      this.selectedMandaat.parent.minAantalHouders &&
      this.lengthExistingMandaten < this.selectedMandaat.parent.minAantalHouders
    ) {
      const minimumToCreate =
        this.selectedMandaat.parent.minAantalHouders -
        this.lengthExistingMandaten;
      this.rowsToCreateHelpText = `Je moet nog minimum ${minimumToCreate} ${minimumToCreate <= 1 ? 'mandaat' : 'mandaten'} aanmaken voor dit orgaan.`;
    }
    this.addWarningWhenMandatenAreAtMax();
    if (this.selectedMandaat.parent.maxAantalHouders) {
      this.rowsToGenerate =
        this.selectedMandaat.parent.maxAantalHouders -
        this.lengthExistingMandaten;
    } else {
      this.rowsToGenerate = 1;
    }
  });

  validateRows = restartableTask(async (event) => {
    await timeout(INPUT_DEBOUNCE);
    this.rowWarnings.clear();
    const inputValue = parseInt(event.target?.value);
    if (isNaN(inputValue)) {
      this.rowsToGenerate = null;
      this.rowWarnings.pushObject('Geef een positief getal in.');
      return;
    }
    this.addWarningWhenMandatenAreAtMax();
    if (
      inputValue + this.lengthExistingMandaten >
      this.selectedMandaat.parent.maxAantalHouders
    ) {
      const toMuch =
        inputValue -
        this.selectedMandaat.parent.maxAantalHouders +
        this.lengthExistingMandaten;
      this.rowWarnings.pushObject(
        `Je gaat meer mandaten aanmaken dan er gewenst is. ${toMuch} teveel.`
      );
    }

    this.rowsToGenerate = inputValue;
  });

  onConfigReady = task(async () => {
    this.args.onConfigReceived({
      mandaat: this.selectedMandaat.parent,
      startDate: this.startDate ?? this.args.startDate,
      endDate: this.endDate,
      rows: this.rowsToGenerate,
      existingMandaten: this.lengthExistingMandaten,
    });
  });

  addWarningWhenMandatenAreAtMax() {
    if (
      this.selectedMandaat.parent.maxAantalHouders &&
      this.lengthExistingMandaten >=
        this.selectedMandaat.parent.maxAantalHouders
    ) {
      this.rowWarnings.pushObject(
        `Je hebt het maximum aantal houders voor dit mandaat bereikt.`
      );
    }
  }

  get loadingMessage() {
    return this.args.loadingMessage;
  }

  get isInvaldForGeneration() {
    return !this.selectedMandaat || this.rowsToGenerate <= 0;
  }
}
