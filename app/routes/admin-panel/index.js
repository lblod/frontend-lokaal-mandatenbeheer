import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class AdminPanelRoute extends Route {
  @service currentSession;
  @service session;
  @service router;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');

    if (this.currentSession.isUserOrImpersonator) {
      this.router.replaceWith('overzicht');
    }
  }
}
