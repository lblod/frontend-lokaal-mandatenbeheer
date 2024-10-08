import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

import moment from 'moment';

export default class DatepickerComponent extends Component {
  elementId = `date-${guidFor(this)}`;

  @tracked dateInputString;

  constructor() {
    super(...arguments);

    if (this.args.value) {
      this.dateInputString = moment(this.bestuursorgaanEndDate).format(
        'DD-MM-YYYY'
      );

      console.log(`startValue`, this.dateInputString);
    }
  }

  @action
  onChange(event) {
    const inputValue = event.target?.value;
    this.dateInputString = inputValue;
    const date = new Date(this.dateInputString);
    if (this.isValidDate(date) && this.args.onChange) {
      this.args.onChange(date);
    }
  }

  isValidDate(date) {
    return date instanceof Date && !isNaN(date);
  }
}
