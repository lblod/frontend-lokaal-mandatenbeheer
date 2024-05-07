import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class MandatenbeheerBestuursperiodenSelectorComponent extends Component {
  @service store;

  @tracked periodOptions;
  @tracked selectedPeriod;

  constructor() {
    super(...arguments);
    this.load();
  }

  async load() {
    this.periodOptions = await this.store.query('bestuursperiode', {
      sort: 'label',
    });
    if (this.args.queryParams) {
      this.selectedPeriod = this.periodOptions.find((period) => {
        return period.id == this.args.queryParams;
      });
    } else {
      this.selectedPeriod = this.periodOptions.at(-1);
    }
  }

  @action
  selectPeriod(periode) {
    this.args.onSelect(periode);
  }
}
