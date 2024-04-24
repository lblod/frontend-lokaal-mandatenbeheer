import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { BESTUURSORGAAN_FORM_ID } from 'frontend-lmb/utils/well-known-ids';
import RSVP from 'rsvp';

export default class OrganenEditRoute extends Route {
  @service store;

  async model() {
    const parentModel = this.modelFor('organen.orgaan');
    const formDefinition = getFormFrom(this.store, BESTUURSORGAAN_FORM_ID);

    return RSVP.hash({
      form: formDefinition,
      instanceId: parentModel.instanceId,
      bestuursorgaan: parentModel.bestuursorgaan,
    });
  }
}