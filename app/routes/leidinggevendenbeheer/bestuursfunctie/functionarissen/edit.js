import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class LeidinggevendenbeheerBestuursfunctieFunctionarissenEditRoute extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('functionaris', params.functionaris_id);
  }
}
