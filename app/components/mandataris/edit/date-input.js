import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

import { restartableTask, timeout } from 'ember-concurrency';
import moment from 'moment';
import { trackedFunction } from 'reactiveweb/function';
import { use } from 'ember-resources';

import { INPUT_DEBOUNCE } from 'frontend-lmb/utils/constants';
import {
  endOfDay,
  isDateInRange,
  isValidDate,
} from 'frontend-lmb/utils/date-manipulation';

function getWarningMessages() {
  return trackedFunction(async () => {
    if (this.errorMessage) {
      return [];
    }

    const warnings = [];
    if (
      !isDateInRange(this.args.value, this.minDate, this.maxDate) &&
      this.inputIsValidDate
    ) {
      const formattedMinDate = moment(this.minDate).format('DD-MM-YYYY');
      const formattedMaxDate = moment(this.maxDate).format('DD-MM-YYYY');
      if (
        this.minDate &&
        this.maxDate &&
        moment(this.maxDate).isAfter(moment(this.minDate))
      ) {
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
export default class MandatarisEditDateInput extends Component {
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

  get inputIsValidDate() {
    return isValidDate(this.args.value);
  }

  get warningMessages() {
    return this.getWarningMessages?.value || [];
  }

  get showWarnings() {
    return this.warningMessages.length >= 1;
  }

  get errorMessage() {
    if (this.inputHasBeenFocused) {
      if (!this.args.value) {
        return 'Dit veld is verplicht';
      }

      if (!isValidDate(this.args.value) && this.args.isRequired) {
        return 'Dit is geen geldige datum';
      }
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
    let date = null;
    if (inputValue?.trim() !== '') {
      date = moment(inputValue, 'DD-MM-YYYY', true)?.toDate() ?? null;
    }
    if (this.args?.endOfDay && date) {
      this.args.onChange?.(endOfDay(date));
    } else {
      this.args.onChange?.(date);
    }
  });
}
