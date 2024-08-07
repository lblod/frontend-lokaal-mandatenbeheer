import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import { task, restartableTask, timeout } from 'ember-concurrency';
import { INPUT_DEBOUNCE } from 'frontend-lmb/utils/constants';

export default class GenerateRowsFormComponent extends Component {
  @service store;

  @tracked mandaatOptions;
  @tracked selectedMandaat;
  @tracked rowsToGenerate;
  @tracked rowWarnings = [];
  @tracked lengthExistingMandaten = 0;

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

  @action
  async selectMandaat(mandaatOption) {
    this.selectedMandaat = mandaatOption;
    await this.checkPossibleMandatenToGenerate.perform();
  }

  checkPossibleMandatenToGenerate = restartableTask(async () => {
    this.rowWarnings = [];
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
      this.selectedMandaat.parent.maxAantalHouders &&
      this.lengthExistingMandaten >=
        this.selectedMandaat.parent.maxAantalHouders
    ) {
      this.rowWarnings.push(
        `Je hebt het maximum aantal houders voor dit mandaat bereikt.`
      );
    }
    if (
      this.selectedMandaat.parent.minAantalHouders &&
      this.lengthExistingMandaten < this.selectedMandaat.parent.minAantalHouders
    ) {
      const minimumToCreate =
        this.selectedMandaat.parent.minAantalHouders -
        this.lengthExistingMandaten;
      this.rowWarnings.push(
        `Je moet nog minimum ${minimumToCreate} mandaten aanmaken voor dit bestuursorgaan.`
      );
    }

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
    const inputValue = parseInt(event.target?.value);
    if (isNaN(inputValue)) {
      this.rowsToGenerate = null;
      this.rowWarnings.push('Geef een positief getal in.');
      return;
    }
    if (
      inputValue + this.lengthExistingMandaten >
      this.selectedMandaat.parent.maxAantalHouders
    ) {
      const toMuch =
        inputValue -
        this.selectedMandaat.parent.maxAantalHouders +
        this.lengthExistingMandaten;
      this.rowWarnings.push(
        `Je gaat meer mandaten aanmaken dan er gewenst is ${toMuch} teveel.`
      );
    }

    this.rowsToGenerate = inputValue;
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
