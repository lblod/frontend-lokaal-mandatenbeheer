import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { getForm } from 'frontend-lmb/utils/get-form';
import { FRACTIE_FORM_ID } from 'frontend-lmb/utils/well-known-ids';

export default class MandaatbeheerFractiesEditRoute extends Route {
  @service store;

  async model(params) {
    const form = await getForm(this.store, FRACTIE_FORM_ID);
    // temporary workaround: we will only have one when we follow the wireframes...
    const selectedBestuursorgaan =
      this.modelFor('mandatenbeheer').bestuursorganen[0];
    return {
      form,
      instanceId: params.id,
      bestuursorgaan: selectedBestuursorgaan,
    };
  }
}
