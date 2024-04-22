import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { FUNCTIONARIS_CREATE_FORM_ID } from 'frontend-lmb/utils/well-known-ids';

export default class LeidinggevendenBestuursfunctieFunctionarissenNewRoute extends Route {
  @service store;

  async model() {
    const form = await getFormFrom(this.store, FUNCTIONARIS_CREATE_FORM_ID);
    const bestuursfunctie = this.modelFor('leidinggevenden.bestuursfunctie');

    return {
      form,
      bestuursfunctie,
    };
  }
}
