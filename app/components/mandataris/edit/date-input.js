import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

import { restartableTask, timeout } from 'ember-concurrency';
import moment from 'moment';
import { INPUT_DEBOUNCE } from 'frontend-lmb/utils/constants';
import {
  endOfDay,
  isDateInRange,
  isValidDate,
} from 'frontend-lmb/utils/date-manipulation';

export default class MandatarisEditDateInput extends Component {
  elementId = `date-${guidFor(this)}`;

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

  get hardMinDate() {
    return isValidDate(this.args.from) ? this.args.from : null;
  }

  get hardMaxDate() {
    return isValidDate(this.args.to) ? this.args.to : null;
  }

  get dynamicTo() {
    return isValidDate(this.args.dynamicTo) ? this.args.dynamicTo : null;
  }

  get dynamicFrom() {
    return isValidDate(this.args.dynamicFrom) ? this.args.dynamicFrom : null;
  }

  get minDate() {
    if (
      this.dynamicFrom &&
      moment(this.dynamicFrom).isSameOrAfter(moment(this.hardMinDate))
    ) {
      return this.dynamicFrom;
    }

    return this.hardMinDate;
  }

  get maxDate() {
    if (
      this.dynamicTo &&
      moment(this.dynamicTo).isSameOrBefore(moment(this.hardMaxDate))
    ) {
      return this.dynamicTo;
    }

    return this.hardMaxDate;
  }

  get errorMessage() {
    return this.getErrorMessage(this.args.value);
  }

  getErrorMessage(date) {
    if (this.inputHasBeenFocused) {
      if (!date && this.args.isRequired) {
        return 'Dit veld is verplicht';
      }
    }
    if (date && !isValidDate(date)) {
      return 'Dit is geen geldige datum';
    }
    if (
      !isDateInRange(date, this.minDate, this.maxDate) &&
      this.inputIsValidDate
    ) {
      const formattedMinDate = moment(this.minDate).format('DD-MM-YYYY');
      const formattedMaxDate = moment(this.maxDate).format('DD-MM-YYYY');
      if (this.minDate && this.maxDate) {
        return `Kies een datum tussen ${formattedMinDate} en ${formattedMaxDate}.`;
      }

      if (this.minDate && !this.maxDate) {
        return `Kies een datum vanaf ${formattedMinDate}`;
      }

      if (!this.minDate && this.maxDate) {
        return `Kies een datum tot ${formattedMaxDate}`;
      }
    }
    return null;
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
    const hasErrors =
      this.getErrorMessage(date) ||
      (!date && this.args.isRequired) ||
      (date && !isValidDate(date));
    if (this.args?.endOfDay && date) {
      this.args.onChange?.(endOfDay(date), { hasErrors });
    } else {
      this.args.onChange?.(date, { hasErrors });
    }
  });
}
