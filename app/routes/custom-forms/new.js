import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class CustomFormsNewRoute extends Route {
  @service customForms;

  async model() {
    const id = await this.customForms.createEmptyDefinition('Test');
    return id;
  }
}
