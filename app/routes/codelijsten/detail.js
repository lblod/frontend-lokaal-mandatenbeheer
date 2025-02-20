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
    const concepten = (await codelijst?.concepts) ?? [];

    return {
      codelijst,
      concepten,
      keyValueState: this.createKeyValueState(codelijst, concepten),
    };
  }

  createKeyValueState(codelijst, concepten) {
    const keyValue = {
      [codelijst.id]: codelijst.label,
    };
    for (const concept of concepten) {
      keyValue[concept.id] = concept.label;
    }

    return keyValue;
  }
}
