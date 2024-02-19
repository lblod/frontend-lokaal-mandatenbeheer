import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { BESTUURSORGAAN_FORM_ID } from 'frontend-lmb/utils/well-known-ids';
import RSVP from 'rsvp';

export default class MandatenbeheerBestuursorganenEditRoute extends Route {
  @service store;
  async model(params) {
    const bestuursorgaan = this.store.findRecord(
      'bestuursorgaan',
      params.orgaan_id,
      {
        include: 'classificatie,heeft-tijdsspecialisaties',
      }
    );
    const formDefinition = getFormFrom(this.store, BESTUURSORGAAN_FORM_ID);

    return RSVP.hash({
      form: formDefinition,
      instanceId: params.orgaan_id,
      bestuursorgaan,
    });
  }
}
