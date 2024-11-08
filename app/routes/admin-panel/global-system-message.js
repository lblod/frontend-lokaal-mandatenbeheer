import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class AdminPanelGlobalSystemMessageRoute extends Route {
  @service currentSession;
  @service session;
  @service store;
  @service router;
  @service globalSystemMessage;
  @service impersonation;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');

    if (!this.currentSession.isAdmin || this.impersonation.isImpersonating) {
      this.router.replaceWith('index');
    }
  }

  async model() {
    return await this.globalSystemMessage.findMessage();
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.setMessageFromModel(model);
  }
}
