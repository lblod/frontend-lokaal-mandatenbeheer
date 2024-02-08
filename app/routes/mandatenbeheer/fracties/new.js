import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { FRACTIE_FORM_ID } from 'frontend-lmb/utils/well-known-ids';

export default class MandatenbeheerFractiesNewRoute extends Route {
  @service store;

  async model() {
    const form = await getFormFrom(this.store, FRACTIE_FORM_ID);
    const mandatenbeheerFracties = this.modelFor('mandatenbeheer.fracties');

    return {
      form,
      ...mandatenbeheerFracties,
    };
  }
}
