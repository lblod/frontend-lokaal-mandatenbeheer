import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class AdminPanelBannerMessageRoute extends Route {
  @service currentSession;
  @service session;
  @service store;
  @service router;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');

    if (!this.currentSession.isAdmin) {
      this.router.replaceWith('index');
    }
  }

  async model() {
    const globalSystemMessages = await this.store.findAll(
      'global-system-message'
    );

    return globalSystemMessages.length >= 1 ? globalSystemMessages.at(0) : null;
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.setMessageFromModel(model);
  }
}
