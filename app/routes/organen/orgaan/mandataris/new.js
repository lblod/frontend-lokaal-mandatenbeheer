import Route from '@ember/routing/route';

import { service } from '@ember/service';

import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { MANDATARIS_NEW_FORM_ID } from 'frontend-lmb/utils/well-known-ids';
import RSVP from 'rsvp';

export default class OrganenMandatarisNewRoute extends Route {
  @service store;
  @service currentSession;

  async model() {
    const { currentBestuursorgaan } = this.modelFor('organen.orgaan');
    const mandatarisNewForm = getFormFrom(this.store, MANDATARIS_NEW_FORM_ID);
    const bestuurseenheid = this.currentSession.group;

    return RSVP.hash({
      bestuurseenheid,
      currentBestuursorgaan,
      mandatarisNewForm,
    });
  }
}
