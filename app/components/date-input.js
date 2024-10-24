import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

import { restartableTask, timeout } from 'ember-concurrency';
import moment from 'moment';

import { INPUT_DEBOUNCE, NULL_DATE } from 'frontend-lmb/utils/constants';
import { action } from '@ember/object';

export default class DateInputComponent extends Component {
  elementId = `date-${guidFor(this)}`;

  @tracked dateInputString;
  @tracked errorMessage;
  @tracked invalidErrorMessage;

  onChange = restartableTask(async (event) => {
    await timeout(INPUT_DEBOUNCE);

    const inputValue = event.target?.value;
    this.dateInputString = inputValue;

    let [day, month, year] = inputValue.split('-');
    const formatForDateConstructor = `${month}-${day}-${year}`;
    const date = this.processDate(new Date(formatForDateConstructor) ?? null);

    if (!this.args.isRequired && !isValidDate(date)) {
      this.invalidErrorMessage = null;
    }

    if (!isValidDate(date)) {
      this.args.onChange?.(null);
      return;
    }
    this.args.onChange?.(date);
  });

  isDateInRange(date, min, max) {
    if (!date) {
      return false;
    }
    if (!min && !max) {
      return true;
    }
    if (!min && max) {
      return moment(date).isSameOrBefore(moment(max));
    }
    if (!max && min) {
      return moment(date).isSameOrAfter(moment(min));
    }

    return moment(date).isBetween(moment(min), moment(max), 'day', '[]');
  }

  processDate(date) {
    if (!isValidDate(date)) {
      this.invalidErrorMessage = `Datum is ongeldig.`;
      this.errorMessage = null;

      return date;
    }
    this.invalidErrorMessage = null;

    const minDate = isValidDate(this.args.from) ? this.args.from : null;
    const maxDate =
      isValidDate(this.args.to) &&
      !moment(this.args.to).isSame(moment(NULL_DATE))
        ? this.args.to
        : null;

    if (!this.isDateInRange(date, minDate, maxDate)) {
      const stringMinDate = isValidDate(minDate)
        ? moment(minDate).format('DD-MM-YYYY')
        : null;
      const stringMaxDate = isValidDate(maxDate)
        ? moment(maxDate).format('DD-MM-YYYY')
        : null;
      this.errorMessage = `Kies een datum tussen ${stringMinDate || 'een moment in het verleden'} en ${stringMaxDate || 'een moment in de toekomst'}.`;
    } else {
      this.errorMessage = null;
    }

    return date;
  }

  @action
  setupDateValue() {
    if (this.args.value && isValidDate(this.args.value)) {
      this.dateInputString = moment(this.args.value).format('DD-MM-YYYY');
      this.processDate(this.args.value);
    }
  }

  get errorMessages() {
    return `${this.invalidErrorMessage ?? ''} ${this.invalidErrorMessage ? '\n' : ''} ${this.errorMessage ?? ''}`;
  }
}

export function isValidDate(date) {
  return date && date instanceof Date && !isNaN(date);
}

export function isDateInRange(date, min, max) {
  if (!date) {
    return false;
  }
  if (!min && !max) {
    return true;
  }
  if (!min && max) {
    return moment(date).isSameOrBefore(moment(max));
  }
  if (!max && min) {
    return moment(date).isSameOrAfter(moment(min));
  }

  return moment(date).isBetween(moment(min), moment(max), 'day', '[]');
}
