import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class CodelijstenDetailViewRoute extends Route {
  @service store;

  async model() {
    const codelijst = this.modelFor('codelijsten.detail');
    const concepten = await codelijst.concepts;

    return {
      codelijst,
      concepten: concepten.sortBy('order'),
    };
  }
}
