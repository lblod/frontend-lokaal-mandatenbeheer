import Modifier from 'ember-modifier';

import { isValidDate } from './index';

import moment from 'moment';

export default class SetupDateValue extends Modifier {
  // This is called every time an argument changes
  modify(element, [dateValue, endOfDay, processDateCb]) {
    if (dateValue && isValidDate(dateValue)) {
      let date;
      if (endOfDay) {
        date = dateValue;
        element.value = moment(date).format('DD-MM-YYYY');
      } else {
        date = moment(dateValue).toDate();
        element.value = moment(dateValue).format('DD-MM-YYYY');
      }
      () => processDateCb(date);
    }
  }
}

// @action
// setupDateValue() {
//   console.log(`setupDateValue`);
//   if (this.args.value && isValidDate(this.args.value)) {
//     let date;
//     if (this.args?.endOfDay) {
//       date = this.args.value;
//       this.dateInputString = moment(date).format('DD-MM-YYYY');
//     } else {
//       date = moment(this.args.value).toDate();
//       this.dateInputString = moment(this.args.value).format('DD-MM-YYYY');
//     }
//     this.processDate(date);
//   }
// }
