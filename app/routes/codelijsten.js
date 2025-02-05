import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class CodelijstenRoute extends Route {
  @service session;
  @service router;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');

    this.router.transitionTo('codelijsten.overzicht');
  }
}
