import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { FUNCTIONARIS_EDIT_FORM_ID } from 'frontend-lmb/utils/well-known-ids';

export default class LeidinggevendenbeheerBestuursfunctieFunctionarissenEditRoute extends Route {
  @service store;

  async model(params) {
    const functionaris = await this.store.findRecord(
      'functionaris',
      params.functionaris_id
    );

    const form = await getFormFrom(this.store, FUNCTIONARIS_EDIT_FORM_ID);

    return {
      functionaris,
      form,
      instanceId: params.functionaris_id,
    };
  }
}
