import Route from '@ember/routing/route';

import { service } from '@ember/service';

import { createKeyValueState } from 'frontend-lmb/utils/create-codelist-state';
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
      reload: true,
    });
    const concepten = (await codelijst?.concepts) ?? [];

    return {
      ogCodelistName: codelijst.label,
      codelijst,
      concepten,
      keyValueState: createKeyValueState(codelijst, concepten),
    };
  }
}
