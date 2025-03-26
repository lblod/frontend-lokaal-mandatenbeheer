import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class CustomFormsOverviewRoute extends Route {
  @service store;
  @service session;

  queryParams = {
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
  };

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model(params) {
    const formDefinitions = await this.store.query('form', {
      sort: params.sort || '-modified-at',
      page: {
        number: params.page,
        size: params.size,
      },
    });

    return { formDefinitions };
  }
}
