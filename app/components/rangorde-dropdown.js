import Component from '@glimmer/component';

import { action } from '@ember/object';

import { rangordeStringMapping } from 'frontend-lmb/utils/rangorde';

export default class RangordeDropdown extends Component {
  noRangordeLabel = 'Geen rangorde';

  get labels() {
    const options = Object.keys(rangordeStringMapping).map(
      (key) => `${key} ${this.args.mandaatLabel}`
    );

    return [this.noRangordeLabel, ...options];
  }

  @action
  onUpdateRangorde(rangordeLabel) {
    let rangorde = rangordeLabel;
    if (rangorde === this.noRangordeLabel) {
      rangorde = null;
    }
    this.args.onNewRangorde(rangorde);
  }
}
