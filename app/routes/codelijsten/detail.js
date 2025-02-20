import Route from '@ember/routing/route';

import { service } from '@ember/service';

import { queryRecord } from 'frontend-lmb/utils/query-record';

export default class CodelijstenDetailRoute extends Route {
  @service session;
  @service store;
  @service router;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model(params) {
    const codelijst = await queryRecord(this.store, 'concept-scheme', {
      'filter[:id:]': params.id,
      include: 'concepts',
    });

    return { codelijst, concepten: (await codelijst?.concepts) ?? [] };
  }
}
