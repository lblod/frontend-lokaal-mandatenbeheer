import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class MandatarissenSearchRoute extends Route {
  @service store;

  queryParams = {
    filter: { refreshModel: true },
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
  };

  async model(params) {
    const options = this.getOptions(params);
    const personen = await this.store.query('persoon', options);

    return {
      personen,
    };
  }

  getOptions(params) {
    const queryParams = {
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
      'filter[:has:is-aangesteld-als]': true,
      include:
        'is-aangesteld-als,is-aangesteld-als.bekleedt,is-aangesteld-als.bekleedt.bestuursfunctie',
    };

    if (params.filter && params.filter.length > 0) {
      queryParams.filter = params.filter;
    }

    return queryParams;
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.searchData = this.paramsFor('mandatarissen.search')['filter'];
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
