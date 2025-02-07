import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class CodelijstenDetailViewRoute extends Route {
  @service session;
  @service store;

  async model() {
    const parentModel = await this.modelFor('codelijsten.detail');

    return { ...parentModel };
  }
}
