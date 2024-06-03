import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class MandatarissenPersoonIndexRoute extends Route {
  @service store;

  async model() {
    const parentModel = await this.modelFor('mandatarissen.persoon');

    return {
      persoon: parentModel.persoon,
    };
  }
}
