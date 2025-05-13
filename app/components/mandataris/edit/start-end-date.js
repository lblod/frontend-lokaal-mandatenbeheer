import Component from '@glimmer/component';

import { action } from '@ember/object';

import moment from 'moment';
import { tracked } from '@glimmer/tracking';

import {
  isDateInRange,
  isValidDate,
} from 'frontend-lmb/utils/date-manipulation';

export default class MandatarisEditStartEndDate extends Component {
  @tracked startErrorMessage;
  @tracked endErrorMessage;

  get hardMinDate() {
    return isValidDate(this.args.from) ? this.args.from : null;
  }

  get hardMaxDate() {
    return isValidDate(this.args.to) ? this.args.to : null;
  }

  get dynamicTo() {
    return isValidDate(this.args.endDate) ? this.args.endDate : null;
  }

  get dynamicFrom() {
    return isValidDate(this.args.startDate) ? this.args.startDate : null;
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

  get startDateLabel() {
    return this.args.startDateLabel || 'Startdatum';
  }

  get endDateLabel() {
    return this.args.endDateLabel || 'Einddatum';
  }

  getErrorMessage(date, fieldLabel) {
    if (!date && fieldLabel === this.startDateLabel) {
      return 'Dit veld is verplicht';
    }
    if (date && !isValidDate(date)) {
      return 'Dit is geen geldige datum';
    }
    if (!isDateInRange(date, this.minDate, this.maxDate) && isValidDate(date)) {
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

  @action
  updateDates(fieldLabel, date) {
    if (fieldLabel === this.startDateLabel) {
      this.args.onChange?.(date, this.args.endDate);
      this.startErrorMessage = this.getErrorMessage(date, this.startDateLabel);
      this.endErrorMessage = this.getErrorMessage(
        this.args.endDate,
        this.endDateLabel
      );
    } else {
      this.args.onChange?.(this.args.startDate, date);
      this.startErrorMessage = this.getErrorMessage(
        this.args.startDate,
        this.startDateLabel
      );
      this.endErrorMessage = this.getErrorMessage(date, this.endDateLabel);
    }

    this.args.onErrorStateUpdated?.({
      id: 'startDate',
      hasErrors: !!this.startErrorMessage,
    });
    this.args.onErrorStateUpdated?.({
      id: 'endDate',
      hasErrors: !!this.endErrorMessage,
    });
  }
}
