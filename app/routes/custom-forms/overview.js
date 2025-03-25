import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class CustomFormsOverviewRoute extends Route {
  @service store;

  async model() {
    const formDefinitions = await this.store.findAll('form');
    console.log({ formDefinitions });
    return formDefinitions;
  }
}
