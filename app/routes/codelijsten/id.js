import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class CodelijstenIdRoute extends Route {
  @service session;
  @service store;

  queryParams = {
    sort: { refreshModel: true },
  };

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model(params) {
    const codelijst = await this.store.findRecord('concept-scheme', params.id);
    const concepten = await this.store.query('concept', {
      sort: params.sort ?? 'label',
      'filter[concept-schemes][:id:]': params.id,
    });

    return {
      codelijst,
      concepten,
    };
  }
}
