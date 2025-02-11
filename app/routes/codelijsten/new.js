import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class CodelijstenNewRoute extends Route {
  @service store;

  setupController(controller) {
    super.setupController(...arguments);
    this.store
      .peekAll('concept-scheme')
      .filter((cs) => !cs.id)
      .map((cs) => cs.rollbackAttributes());
    this.store
      .peekAll('concept')
      .filter((c) => !c.id)
      .map((c) => c.rollbackAttributes());

    controller.concepten.clear();
  }
}
