import Component from '@glimmer/component';

import { rangordeStringMapping } from 'frontend-lmb/utils/rangorde';

export default class RangordeDropdown extends Component {
  get labels() {
    return Object.keys(rangordeStringMapping).map(
      (key) => `${key} ${this.args.mandaatLabel}`
    );
  }
}
