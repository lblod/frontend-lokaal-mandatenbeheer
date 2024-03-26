import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';

export default class MandatenbeheerBeleidsdomeinSelectorWithCreateComponent extends Component {
  @service store;

  @tracked _beleidsdomeinen = [];

  constructor() {
    super(...arguments);
    this._beleidsdomeinen = this.args.beleidsdomeinen || [];
  }

  @restartableTask
  *searchByName(searchData) {
    yield timeout(SEARCH_TIMEOUT);
    let queryParams = {
      sort: 'label',
      'filter[label]': searchData,
    };

    return yield this.store.query('beleidsdomein-code', queryParams);
  }

  @action
  select(beleidsdomeinen) {
    this._beleidsdomeinen.setObjects(beleidsdomeinen);
    this.args.onSelect(this._beleidsdomeinen);
  }

  @action
  async create(beleidsdomein) {
    let domein = await this.store.createRecord('beleidsdomein-code', {
      label: beleidsdomein,
    });
    this._beleidsdomeinen.pushObject(domein);
    this.args.onSelect(this._beleidsdomeinen);
  }

  @action
  suggest(term) {
    return `Voeg "${term}" toe`;
  }
}
