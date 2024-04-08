import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';
import { BELEIDSDOMEIN_CODES_CONCEPT_SCHEME } from 'frontend-lmb/utils/well-known-uris';

export default class MandatenbeheerBeleidsdomeinSelectorWithCreateComponent extends Component {
  @service store;

  @tracked selected = [];
  @tracked options = [];
  conceptScheme = BELEIDSDOMEIN_CODES_CONCEPT_SCHEME;

  constructor() {
    super(...arguments);
    this.selected = this.args.beleidsdomeinen || [];
    this.load();
  }

  async load() {
    this.options = await this.fetchOptions();
  }

  async fetchOptions(searchData) {
    let queryParams = {
      sort: 'label',
    };
    if (searchData) {
      queryParams['filter[label]'] = searchData;
    }
    return await this.store.query('beleidsdomein-code', queryParams);
  }

  search = task({ restartable: true }, async (searchData) => {
    await timeout(SEARCH_TIMEOUT);
    return await this.fetchOptions(searchData);
  });

  @action
  select(beleidsdomeinen) {
    this.selected.setObjects(beleidsdomeinen);
    this.args.onSelect(this.selected);
  }

  @action
  add(beleidsdomein) {
    let tmp = this.selected;
    tmp.push(beleidsdomein);
    this.select(tmp);
  }
}
