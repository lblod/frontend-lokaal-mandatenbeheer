import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class AdminPanelGlobalSystemMessageRoute extends Route {
  @service currentSession;
  @service session;
  @service store;
  @service router;
  @service impersonation;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');

    if (!this.currentSession.isAdmin || this.impersonation.isImpersonating) {
      this.router.replaceWith('index');
    }
  }

  async setupController(controller) {
    super.setupController(controller);
    await controller.setMessageFromModel();
  }
}
