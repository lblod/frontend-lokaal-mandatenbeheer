import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class AdminPanelGlobalSystemMessageRoute extends Route {
  @service currentSession;
  @service session;
  @service router;
  @service('globalSystemMessage') messageService;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');

    if (this.currentSession.isUserOrImpersonator) {
      this.router.replaceWith('overzicht');
    }
  }

  async setupController() {
    super.setupController();
    await this.messageService.findMessage();
  }
}
