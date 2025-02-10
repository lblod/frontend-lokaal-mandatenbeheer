import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class CodelijstenDetailViewRoute extends Route {
  @service store;

  beforeModel() {
    this.store.unloadAll('concept');
  }

  async model() {
    const codelijst = this.modelFor('codelijsten.detail');

    return { codelijst, concepten: await codelijst.concepts };
  }
}
