import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class CodelijstenNewRoute extends Route {
  @service store;

  model() {
    const codelijst = this.store.createRecord('concept-scheme', {
      label: 'Nieuwe codelijst',
      createdAt: new Date(),
      isReadOnly: false,
    });

    return {
      codelijst,
      concept: [],
    };
  }
}
