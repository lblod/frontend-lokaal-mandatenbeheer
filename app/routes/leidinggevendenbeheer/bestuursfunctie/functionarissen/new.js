import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { getForm } from 'frontend-lmb/utils/get-form';
import { FUNCTIONARIS_CREATE_FORM_ID } from 'frontend-lmb/utils/well-known-ids';

export default class LeidinggevendenbeheerBestuursfunctieFunctionarissenNewRoute extends Route {
  @service store;

  async model() {
    const form = await getForm(this.store, FUNCTIONARIS_CREATE_FORM_ID);

    return {
      form,
    };
  }
}
