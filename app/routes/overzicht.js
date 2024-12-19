import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class OverzichtRoute extends Route {
  @service currentSession;
  @service session;
  @service router;
  @service impersonation;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
    if (
      this.currentSession.showAdminFeatures ||
      this.impersonation.isImpersonating
    ) {
      this.router.replaceWith('overzicht.admin');
    }
  }
}
