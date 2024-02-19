import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default class OrganenRoute extends Route {
  @service currentSession;
  @service session;
  @service router;
  @service store;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');

    // TODO we probably want some access rights here.
    // if (!this.currentSession.canAccessBestuursorganen)
    //   this.router.transitionTo('index');
  }

  async model() {
    const bestuurseenheid = this.currentSession.group;
    const bestuursorganen = await this.getAllBestuursorganen(
      bestuurseenheid.get('id')
    );

    return RSVP.hash({
      bestuurseenheid,
      bestuursorganen,
    });
  }

  async getAllBestuursorganen(bestuurseenheidId) {
    return await this.store.query('bestuursorgaan', {
      'filter[bestuurseenheid][id]': bestuurseenheidId,
    });
  }
}
