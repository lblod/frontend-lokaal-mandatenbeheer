import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class EigenGegevensRoute extends Route {
  @service session;
  @service router;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  model() {
    this.router.transitionTo('eigen-gegevens.overzicht');
  }
}
