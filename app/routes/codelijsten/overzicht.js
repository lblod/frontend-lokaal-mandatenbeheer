import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class CodelijstenOverzichtRoute extends Route {
  @service store;

  queryParams = {
    filter: { refreshModel: true },
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
  };

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
        number: params.page,
        size: params.size,
      },
      reload: true,
      ...searchFilter,
    });

    return {
      codelijsten: conceptSchemes,
    };
  }
}
