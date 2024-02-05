import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { getForm } from 'frontend-lmb/utils/get-form';

export default class MandatenbeheerFractiesNewRoute extends Route {
  @service store;

  async model() {
    const formId = 'fractie-new';
    const form = await getForm(this.store, formId);
    const mandatenbeheerFracties = this.modelFor('mandatenbeheer.fracties');

    return {
      form,
      ...mandatenbeheerFracties,
    };
  }
}
