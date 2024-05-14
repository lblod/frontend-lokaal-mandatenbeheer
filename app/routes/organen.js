import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default class OrganenRoute extends Route {
  @service currentSession;
  @service session;
  @service router;
  @service store;
  @service bestuursorganen;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
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
