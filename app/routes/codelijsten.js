import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class CodelijstenRoute extends Route {
  @service session;
  @service store;

  queryParams = {
    filter: { refreshModel: true },
    page: { refreshModel: true },
    sort: { refreshModel: true },
  };

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model(params) {
    const searchFilter = params.filter
      ? {
          'filter[:or:][label]': params.filter,
          'filter[:or:][id]': params.filter,
        }
      : {};
    const conceptSchemes = await this.store.query('concept-scheme', {
      sort: params.sort ?? 'label',
      page: {
        number: params.page?.number ?? 0,
        size: params.page?.size ?? 20,
      },
      ...searchFilter,
    });

    return {
      codelijsten: conceptSchemes,
    };
  }
}
