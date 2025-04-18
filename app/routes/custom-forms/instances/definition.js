import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class CustomFormsInstancesDefinitionRoute extends Route {
  @service store;

  async model({ id }) {
    const form = await this.store.findRecord('form', id);

    return {
      form,
    };
  }
}
