import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class CodelijstenDetailEditRoute extends Route {
  @service store;

  async model() {
    const parentModel = await this.modelFor('codelijsten.detail');

    return { ...parentModel };
  }
}
