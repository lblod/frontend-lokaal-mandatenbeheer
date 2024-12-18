import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class IndexRoute extends Route {
  @service currentSession;
  @service session;
  @service router;

  async beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');

    this.router.replaceWith('overzicht');
  }
}
