import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MandatarissenPersoonRoute extends Route {
  @service store;
  @service bestuursorganen;

  async model(params) {
    const persoon = await this.store.findRecord('persoon', params.id);

    return {
      persoon,
    };
  }
}
