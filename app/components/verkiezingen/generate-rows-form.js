import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { A } from '@ember/array';

import { task, restartableTask, timeout } from 'ember-concurrency';

import { INPUT_DEBOUNCE } from 'frontend-lmb/utils/constants';
import { isValidDate } from '../date-input';
import { rangordeStringToNumber } from 'frontend-lmb/utils/rangorde';

export default class GenerateRowsFormComponent extends Component {
  @service store;

  @tracked selectedMandaat;
  @tracked startDate;
  @tracked endDate;
  @tracked rowsToGenerate;
  @tracked rowWarnings = A([]);
  @tracked rowsToCreateHelpText;

  existingMandatarissen = [];

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
    this.existingMandatarissen = await this.store.query('mandataris', {
      page: {
        size: 9999,
      },
      'filter[bekleedt][:id:]': this.selectedMandaat.parent.id,
      'filter[bekleedt][bevat-in][:id:]': this.args.bestuursorgaan.id,
    });

    if (
      this.selectedMandaat.parent.minAantalHouders &&
      this.lengthExistingMandaten < this.selectedMandaat.parent.minAantalHouders
    ) {
      const minimumToCreate =
        this.selectedMandaat.parent.minAantalHouders -
        this.lengthExistingMandaten;
      this.rowsToCreateHelpText = `Je moet nog ${minimumToCreate} ${minimumToCreate <= 1 ? 'mandataris' : 'mandatarissen'} aanmaken voor dit orgaan.`;
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
        `Je gaat meer mandatarissen aanmaken dan gewenst. ${toMuch} te veel.`
      );
    }

    this.rowsToGenerate = inputValue;
  });

  onConfigReady = task(async () => {
    const notRequiredEndDate = isValidDate(this.endDate) ? this.endDate : null;

    this.args.onConfigReceived({
      mandaatUri: this.selectedMandaat.parent.uri,
      startDate: this.startDate ?? this.args.startDate,
      endDate: notRequiredEndDate,
      count: this.rowsToGenerate,
      rangordeStartsAt: this.getHighestRangordeAsNumber() + 1,
      rangordeLabel: this.rangordeMandaatLabel,
    });
  });

  get rangordeMandaatLabel() {
    if (this.selectedMandaat.parent.isSchepen) {
      return 'schepenen';
    }

    if (this.selectedMandaat.parent.isGemeenteraadslid) {
      return 'lid';
    }

    return '';
  }

  getHighestRangordeAsNumber() {
    if (this.existingMandatarissen.length === 0) {
      return 0;
    }

    return Math.max(
      ...this.existingMandatarissen.map((mandataris) => {
        if (mandataris.rangorde) {
          return rangordeStringToNumber(mandataris.rangorde);
        } else {
          return 0;
        }
      })
    );
  }

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
    return (
      !this.selectedMandaat ||
      this.rowsToGenerate <= 0 ||
      !isValidDate(this.startDate)
    );
  }

  get lengthExistingMandaten() {
    return this.existingMandatarissen.length;
  }
}
