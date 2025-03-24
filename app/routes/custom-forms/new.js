import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class CustomFormsNewRoute extends Route {
  @service customForms;

  async model() {
    const type = await this.customForms.createCustomFormType('Test type');
    const form = await this.customForms.createCustomForm('Test twee', type.id);
    console.log({ type });
    console.log({ form });
    return form;
  }
}
