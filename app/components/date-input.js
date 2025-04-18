import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

import { restartableTask, timeout } from 'ember-concurrency';
import moment from 'moment';
import { trackedFunction } from 'reactiveweb/function';
import { use } from 'ember-resources';

import { INPUT_DEBOUNCE, NULL_DATE } from 'frontend-lmb/utils/constants';
import { endOfDay } from 'frontend-lmb/utils/date-manipulation';

function getWarningMessages() {
  return trackedFunction(async () => {
    const warnings = [];
    if (!isValidDate(this.args.value)) {
      warnings.push('Dit is geen geldige datum');
    }

    if (!isDateInRange(this.args.value, this.minDate, this.maxDate)) {
      const formattedMinDate = moment(this.minDate).format('DD-MM-YYYY');
      const formattedMaxDate = moment(this.maxDate).format('DD-MM-YYYY');
      if (this.minDate && this.maxDate) {
        warnings.push(
          `Kies een datum tussen ${formattedMinDate} en ${formattedMaxDate}.`
        );
      }

      if (this.minDate && !this.maxDate) {
        warnings.push(`Kies een datum vanaf ${formattedMinDate}`);
      }

      if (!this.minDate && this.maxDate) {
        warnings.push(`Kies een datum tot ${formattedMaxDate}`);
      }
    }
    return warnings;
  });
}
export default class DateInputComponent extends Component {
  elementId = `date-${guidFor(this)}`;
  @use(getWarningMessages) getWarningMessages;

  @tracked dateInputString;
  @tracked warningMessage;
  @tracked errorMessage;
  @tracked invalidErrorMessage;

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

  get warningMessages() {
    return this.getWarningMessages?.value || [];
  }

  get minDate() {
    return isValidDate(this.args.from) ? this.args.from : null;
  }

  get maxDate() {
    return isValidDate(this.args.to) ? this.args.to : null;
  }

  onChange = restartableTask(async (event) => {
    await timeout(INPUT_DEBOUNCE);

    const inputValue = event.target?.value;
    this.dateInputString = inputValue;

    const date = this.processDate(
      moment(inputValue, 'DD-MM-YYYY', true).toDate()
    );

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
    if (this.args?.endOfDay) {
      date = endOfDay(date);
    }
    if (!isValidDate(date)) {
      this.invalidErrorMessage = `Datum is ongeldig.`;
      this.errorMessage = null;
      this.warningMessage = null;

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
