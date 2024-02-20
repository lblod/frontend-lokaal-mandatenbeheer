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

    const decretaleBestuursorganen = [];
    const nietDecretaleBestuursorganen = [];
    await Promise.all(
      bestuursorganen.map(async (orgaan) => {
        const isDecretaal = await orgaan.isDecretaal;
        if (isDecretaal) {
          decretaleBestuursorganen.push(orgaan);
        } else {
          nietDecretaleBestuursorganen.push(orgaan);
        }
      })
    );

    return RSVP.hash({
      bestuurseenheid,
      decretaleBestuursorganen,
      nietDecretaleBestuursorganen,
    });
  }

  async getAllBestuursorganen(bestuurseenheidId) {
    return await this.store.query('bestuursorgaan', {
      'filter[bestuurseenheid][id]': bestuurseenheidId,
      'filter[:has-no:deactivated-at]': true,
      include: 'classificatie,is-tijdsspecialisatie-van',
    });
  }
}
