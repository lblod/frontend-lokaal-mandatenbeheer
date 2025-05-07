import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

import { restartableTask, timeout } from 'ember-concurrency';
import moment from 'moment';

import { INPUT_DEBOUNCE } from 'frontend-lmb/utils/constants';
import { endOfDay, isValidDate } from 'frontend-lmb/utils/date-manipulation';

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
