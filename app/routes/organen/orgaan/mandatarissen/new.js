import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { MANDATARIS_NEW_FORM_ID } from 'frontend-lmb/utils/well-known-ids';
import RSVP from 'rsvp';

export default class OrganenMandatarissenNewRoute extends Route {
  @service store;

  async model() {
    const parentModel = this.modelFor('organen.orgaan');
    const mandatarisNewForm = getFormFrom(this.store, MANDATARIS_NEW_FORM_ID);

    return RSVP.hash({
      bestuursorgaan: parentModel.currentBestuursOrgaan,
      mandatarisNewForm,
    });
  }
}
