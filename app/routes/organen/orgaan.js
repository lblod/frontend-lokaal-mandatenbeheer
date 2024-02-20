import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { BESTUURSORGAAN_FORM_ID } from 'frontend-lmb/utils/well-known-ids';
import RSVP from 'rsvp';

export default class OrganenOrgaanRoute extends Route {
  @service store;
  async model(params) {
    const bestuursorgaanId = params.orgaan_id;

    const bestuursorgaan = this.store.findRecord(
      'bestuursorgaan',
      bestuursorgaanId,
      {
        include: 'classificatie,heeft-tijdsspecialisaties',
      }
    );

    const formDefinition = getFormFrom(this.store, BESTUURSORGAAN_FORM_ID);

    return RSVP.hash({
      form: formDefinition,
      instanceId: bestuursorgaanId,
      bestuursorgaan,
    });
  }
}
