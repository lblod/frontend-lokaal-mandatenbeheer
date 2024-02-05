import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { getForm } from 'frontend-lmb/utils/get-form';

export default class MandaatbeheerFractiesEditRoute extends Route {
  @service store;

  async model(params) {
    const formId = 'fractie';
    const form = await getForm(this.store, formId);

    return { form, instanceId: params.id };
  }
}
