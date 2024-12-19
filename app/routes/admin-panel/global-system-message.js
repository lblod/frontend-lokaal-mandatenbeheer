import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class AdminPanelGlobalSystemMessageRoute extends Route {
  @service currentSession;
  @service session;
  @service router;
  @service('globalSystemMessage') messageService;
  @service impersonation;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
    if (
      !this.currentSession.isAdmin ||
      (this.currentSession.isAdmin && !this.impersonation.isImpersonating)
    ) {
      this.router.replaceWith('overzicht');
    }
  }

  async setupController() {
    super.setupController();
    await await this.messageService.findMessage();
  }
}
