import Route from '@ember/routing/route';

import { service } from '@ember/service';

import RSVP from 'rsvp';

export default class OrganenRoute extends Route {
  @service currentSession;
  @service session;
  @service router;
  @service store;
  @service bestuursorganen;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');

    if (!this.currentSession.canAccessMandaat) {
      this.router.transitionTo('index');
    }

    if (this.currentSession.isLokaalBeheerd) {
      this.router.transitionTo('lokaal-beheerd');
    }
  }

  async model() {
    const bestuurseenheid = this.currentSession.group;
    const bestuursorganen =
      await this.bestuursorganen.getAllRealPoliticalBestuursorganen();

    return RSVP.hash({
      bestuurseenheid,
      bestuursorganen,
    });
  }
}
