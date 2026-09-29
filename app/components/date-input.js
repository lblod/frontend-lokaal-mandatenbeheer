import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

import { restartableTask, timeout } from 'ember-concurrency';
import moment from 'moment';

import { INPUT_DEBOUNCE, NULL_DATE } from 'frontend-lmb/utils/constants';
import {
  endOfDay,
  isDateInRange,
  isValidDate,
} from 'frontend-lmb/utils/date-manipulation';
import { action } from '@ember/object';

export default class DateInputComponent extends Component {
  elementId = `date-${guidFor(this)}`;

  @tracked dateInputString;

  constructor() {
    super(...arguments);
    if (this.args.value && isValidDate(this.args.value)) {
      this.dateInputString = moment(this.args.value).format('DD-MM-YYYY');
    }
  }

  get parsedDate() {
    if (!this.dateInputString) {
      return null;
    }
    let date = moment(this.dateInputString, 'DD-MM-YYYY', true).toDate();
    if (this.args?.endOfDay) {
      date = endOfDay(date);
    }
    return date;
  }

  get errorMessage() {
    if (this.dateInputString === undefined) {
      return null;
    }
    if (!isValidDate(this.parsedDate)) {
      return this.args.isRequired ? `Datum is ongeldig.` : null;
    }
    return null;
  }

  get warningMessage() {
    const date = this.parsedDate;
    if (!isValidDate(date)) {
      return null;
    }

    const minDate = isValidDate(this.args.from) ? this.args.from : null;
    const maxDate =
      isValidDate(this.args.to) &&
      !moment(this.args.to).isSame(moment(NULL_DATE))
        ? this.args.to
        : null;

    if (isDateInRange(date, minDate, maxDate)) {
      return null;
    }

    const stringMinDate = isValidDate(minDate)
      ? moment(minDate).format('DD-MM-YYYY')
      : null;
    const stringMaxDate = isValidDate(maxDate)
      ? moment(maxDate).format('DD-MM-YYYY')
      : null;

    return this.getErrorMessageForDateRange(stringMinDate, stringMaxDate);
  }

  onChange = restartableTask(async (event) => {
    await timeout(INPUT_DEBOUNCE);

    const inputValue = event.target?.value;
    this.dateInputString = inputValue;

    const date = this.parsedDate;
    this.args.onChange?.(isValidDate(date) ? date : null, this.errorMessage);
  });

  getErrorMessageForDateRange(minDate, maxDate) {
    if (minDate && maxDate) {
      return `Kies een datum tussen ${minDate} en ${maxDate}.`;
    }

    if (minDate && !maxDate) {
      return `Kies een datum vanaf ${minDate}`;
    }

    if (!minDate && maxDate) {
      return `Kies een datum tot ${maxDate}`;
    }

    return null;
  }

  get errorMessages() {
    return `${this.errorMessage ?? ''}`;
  }

  @action
  onInput(event) {
    // format is 31-01-2025 but can have placeolders as _ so 31-0_-____
    if (
      event.target?.value &&
      event.target.value.split('_').join('').length === 10
    ) {
      this.onChange.perform(event);
    }
  }
}
