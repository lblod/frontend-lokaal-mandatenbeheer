import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

import moment from 'moment';

export default class DateInputComponent extends Component {
  elementId = `date-${guidFor(this)}`;

  @tracked dateInputString;
  @tracked errorMessage;

  constructor() {
    super(...arguments);

    if (this.args.value) {
      this.dateInputString = moment(this.args.value).format('DD-MM-YYYY');
      this.processDate(this.args.value);
    }
  }

  @action
  onChange(event) {
    const inputValue = event.target?.value;
    this.dateInputString = inputValue;
    const result = this.processDate(new Date(this.dateInputString));
    this.args.onChange?.(result.date, result.isValid);
  }

  isValidDate(date) {
    return date instanceof Date && !isNaN(date);
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

    const isInRange = this.isDateInRange(date, minDateTime, maxDateTime);

    if (!isInRange) {
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

    return {
      isValid: isInRange && this.isValidDate(date),
      date: date,
    };
  }
}
