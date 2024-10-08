import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

import { restartableTask, timeout } from 'ember-concurrency';
import moment from 'moment';

import { INPUT_DEBOUNCE } from 'frontend-lmb/utils/constants';

export default class DateInputComponent extends Component {
  elementId = `date-${guidFor(this)}`;

  @tracked dateInputString;
  @tracked errorMessage;

  constructor() {
    super(...arguments);

    if (this.args.value && this.isValidDate(this.args.value)) {
      this.dateInputString = moment(this.args.value).format('DD-MM-YYYY');
      this.processDate(this.args.value);
    }
  }

  onChange = restartableTask(async (event) => {
    await timeout(INPUT_DEBOUNCE);

    const inputValue = event.target?.value;
    this.dateInputString = inputValue;

    let [day, month, year] = inputValue.split('-');
    const formatForDateConstructor = `${month}-${day}-${year}`;
    const date = this.processDate(new Date(formatForDateConstructor) ?? null);

    this.args.onChange?.(date);
  });

  isValidDate(date) {
    return date && date instanceof Date && !isNaN(date);
  }

  isDateInRange(date, min, max) {
    if (!date) {
      return false;
    }

    date.setHours(0, 0, 0, 0);
    if (!min && !max) {
      return true;
    }
    if (min && date.getTime() < min.getTime()) {
      return false;
    }
    if (max && date.getTime() > max.getTime()) {
      return false;
    }

    return true;
  }

  processDate(date) {
    if (!this.isValidDate(date)) {
      this.errorMessage = `Datum is ongeldig.`;
      return date;
    }
    this.errorMessage = null;

    let minDateTime = null;
    let maxDateTime = null;
    if (this.args.from) {
      minDateTime = new Date(this.args.from);
      minDateTime.setHours(0, 0, 0, 0);
    }
    if (this.args.to) {
      maxDateTime = new Date(this.args.to);
      maxDateTime.setHours(0, 0, 0, 0);
    }

    if (!this.isDateInRange(date, minDateTime, maxDateTime)) {
      const stringMinDate = this.isValidDate(minDateTime)
        ? moment(minDateTime).format('DD-MM-YYYY')
        : null;
      const stringMaxDate = this.isValidDate(maxDateTime)
        ? moment(maxDateTime).format('DD-MM-YYYY')
        : null;
      this.errorMessage = `Kies een datum tussen ${stringMinDate || 'een moment in het verleden'} en ${stringMaxDate || 'een moment in de toekomst'}.`;
    } else {
      this.errorMessage = null;
    }

    return date;
  }
}
