import Route from '@ember/routing/route';

import { A } from '@ember/array';
import { service } from '@ember/service';

export default class CodelijstenNewRoute extends Route {
  @service store;

  model() {
    const codelijst = this.store.createRecord('concept-scheme', {
      label: '',
      createdAt: new Date(),
      isReadOnly: false,
    });

    return {
      codelijst,
      concepten: A([]),
    };
  }
}
