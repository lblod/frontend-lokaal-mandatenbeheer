import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class CustomFormsOverviewRoute extends Route {
  @service store;

  queryParams = {
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
  };

  async model(params) {
    const formDefinitions = await this.store.query('form', {
      sort: params.sort || '-target-label',
      page: {
        number: params.page,
        size: params.size,
      },
    });

    return { formDefinitions };
  }
}
