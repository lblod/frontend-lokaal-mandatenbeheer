import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { BESTUURSPERIODE_FORM_ID } from 'frontend-lmb/utils/well-known-ids';
import RSVP from 'rsvp';

export default class OrganenOrgaanBestuursperiodesNewRoute extends Route {
  @service store;

  async model() {
    const { bestuursorgaan } = this.modelFor('organen.orgaan');

    const bestuursperiodeFormDefinition = getFormFrom(
      this.store,
      BESTUURSPERIODE_FORM_ID
    );

    return RSVP.hash({
      bestuursorgaan,
      form: bestuursperiodeFormDefinition,
    });
  }
}
