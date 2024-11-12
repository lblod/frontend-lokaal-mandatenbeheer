import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class AdminPanelGlobalSystemMessageRoute extends Route {
  @service currentSession;
  @service session;
  @service router;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');

    if (!this.currentSession.showAdminFeatures) {
      this.router.replaceWith('index');
    }
  }

  async setupController(controller) {
    super.setupController(controller);
    await controller.setCurrentMessage();
  }
}
