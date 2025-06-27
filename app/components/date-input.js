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

export default class DateInputComponent extends Component {
  elementId = `date-${guidFor(this)}`;

  @tracked dateInputString;
  @tracked warningMessage;
  @tracked errorMessage;

  constructor() {
    super(...arguments);
    if (this.args.value && isValidDate(this.args.value)) {
      let date;
      if (this.args?.endOfDay) {
        date = this.args.value;
        this.dateInputString = moment(date).format('DD-MM-YYYY');
      } else {
        date = moment(this.args.value).toDate();
        this.dateInputString = moment(this.args.value).format('DD-MM-YYYY');
      }
      this.processDate(date);
    }
  }

  onChange = restartableTask(async (event) => {
    await timeout(INPUT_DEBOUNCE);

    const inputValue = event.target?.value;
    this.dateInputString = inputValue;

    const date = this.processDate(
      moment(inputValue, 'DD-MM-YYYY', true).toDate()
    );

    if (!this.args.isRequired && !isValidDate(date)) {
      this.errorMessage = null;
    }

    if (!isValidDate(date)) {
      this.args.onChange?.(null, this.errorMessage);
      return;
    }
    this.args.onChange?.(date, this.errorMessage);
  });

  processDate(date) {
    if (this.args?.endOfDay) {
      date = endOfDay(date);
    }
    if (!isValidDate(date)) {
      this.errorMessage = `Datum is ongeldig.`;
      this.warningMessage = null;

      return date;
    }
    this.errorMessage = null;

    const minDate = isValidDate(this.args.from) ? this.args.from : null;
    const maxDate =
      isValidDate(this.args.to) &&
      !moment(this.args.to).isSame(moment(NULL_DATE))
        ? this.args.to
        : null;

    if (!isDateInRange(date, minDate, maxDate)) {
      const stringMinDate = isValidDate(minDate)
        ? moment(minDate).format('DD-MM-YYYY')
        : null;
      const stringMaxDate = isValidDate(maxDate)
        ? moment(maxDate).format('DD-MM-YYYY')
        : null;

      this.warningMessage = this.getErrorMessageForDateRange(
        stringMinDate,
        stringMaxDate
      );
    } else {
      this.warningMessage = null;
    }

    return date;
  }

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
}
