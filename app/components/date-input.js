import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

import { restartableTask, timeout } from 'ember-concurrency';
import moment from 'moment';
import { trackedFunction } from 'reactiveweb/function';
import { use } from 'ember-resources';

import { INPUT_DEBOUNCE } from 'frontend-lmb/utils/constants';
import { endOfDay } from 'frontend-lmb/utils/date-manipulation';

function getWarningMessages() {
  return trackedFunction(async () => {
    if (this.errorMessage) {
      return [];
    }

    const warnings = [];
    if (!isDateInRange(this.args.value, this.minDate, this.maxDate)) {
      const formattedMinDate = moment(this.minDate).format('DD-MM-YYYY');
      const formattedMaxDate = moment(this.maxDate).format('DD-MM-YYYY');
      if (this.minDate && this.maxDate) {
        warnings.push(
          `Kies een datum tussen ${formattedMinDate} en ${formattedMaxDate}.`
        );
      }

      if (this.minDate && !this.maxDate && this.inputHasBeenFocused) {
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
  @tracked inputHasBeenFocused;

  constructor() {
    super(...arguments);
    if (this.args.value && isValidDate(this.args.value)) {
      let date;
      if (this.args?.endOfDay) {
        date = endOfDay(this.args.value);
        this.dateInputString = moment(date).format('DD-MM-YYYY');
      } else {
        date = moment(this.args.value).toDate();
        this.dateInputString = moment(this.args.value).format('DD-MM-YYYY');
      }
    }
  }

  get warningMessages() {
    return this.getWarningMessages?.value || [];
  }

  get hasWarnings() {
    return this.warningMessages.length >= 1;
  }

  get errorMessage() {
    if (
      !isValidDate(this.args.value) &&
      this.args.isRequired &&
      this.inputHasBeenFocused
    ) {
      return 'Dit is geen geldige datum';
    }
    return null;
  }

  get minDate() {
    return isValidDate(this.args.from) ? this.args.from : null;
  }

  get maxDate() {
    return isValidDate(this.args.to) ? this.args.to : null;
  }

  onChange = restartableTask(async (event) => {
    await timeout(INPUT_DEBOUNCE);
    this.inputHasBeenFocused = true;
    const inputValue = event.target?.value;
    this.dateInputString = inputValue;
    const date = moment(inputValue, 'DD-MM-YYYY', true)?.toDate() ?? null;
    if (this.args?.endOfDay && date) {
      this.args.onChange?.(endOfDay(date));
    } else {
      this.args.onChange?.(date);
    }
  });
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
