import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class MandatenbeheerBestuursperiodenSelectorComponent extends Component {
  @tracked periodOptions;

  constructor() {
    super(...arguments);
    this.periodOptions = this.args.options?.sortBy('startDate') || [];
  }

  @action
  selectPeriod(periode) {
    this.args.onSelect(periode);
  }
}
