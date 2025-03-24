import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class CustomFormsOverviewRoute extends Route {
  @service customForms;

  async model() {
    const types = await this.customForms.getInstanceTypeList();
    const instances = await this.customForms.getInstanceList();
    console.log({ types });
    console.log({ instances });
    return instances;
  }
}
