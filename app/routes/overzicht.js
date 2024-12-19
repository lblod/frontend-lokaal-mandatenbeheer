import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class OverzichtRoute extends Route {
  @service currentSession;
  @service session;
  @service router;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
    if (this.currentSession.isAdmin) {
      this.router.replaceWith('overzicht.admin');
    }
  }
}
