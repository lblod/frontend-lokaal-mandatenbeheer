import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class CustomFormsInstancesDefinitionRoute extends Route {
  @service store;

  queryParams = {
    fullScreenEdit: {},
  };

  async model({ id, fullScreenEdit }) {
    const form = await this.store.findRecord('form', id);

    return {
      form,
      fullScreenEdit: fullScreenEdit && fullScreenEdit === 'true',
    };
  }
}
