import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default class OrganenRoute extends Route {
  @service currentSession;
  @service session;
  @service router;
  @service store;
  @service decretaleOrganen;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model() {
    const bestuurseenheid = this.currentSession.group;
    const bestuursorganen = await this.getAllBestuursorganen(
      bestuurseenheid.get('id')
    );

    console.log(this.currentSession.user);
    const not = this.store.createRecord('system-notification', {
      subject: 'Test',
      message: 'Message test',
      gebruiker: this.currentSession.user,
    });
    await not.save();

    return RSVP.hash({
      bestuurseenheid,
      bestuursorganen,
    });
  }

  async getAllBestuursorganen(bestuurseenheidId) {
    return await this.store.query('bestuursorgaan', {
      'filter[bestuurseenheid][id]': bestuurseenheidId,
      'filter[:has-no:deactivated-at]': true,
      'filter[:has-no:is-tijdsspecialisatie-van]': true,
      'filter[classificatie][id]':
        this.decretaleOrganen.classificatieIds.join(','), // only organs with a political mandate
      include: 'classificatie,heeft-tijdsspecialisaties',
    });
  }
}
