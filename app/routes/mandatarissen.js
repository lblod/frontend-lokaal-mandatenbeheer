import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class MandatarissenRoute extends Route {
  @service currentSession;
  @service session;
  @service router;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');

    if (!this.currentSession.canAccessMandaat) {
      this.router.transitionTo('index');
    }

    if (this.currentSession.isLokaalBeheerd) {
      this.router.transitionTo('lokaal-beheerd');
    }
  }
}
