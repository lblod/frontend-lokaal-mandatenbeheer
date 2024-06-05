import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class FormInstanceRoute extends Route {
  @service store;

  async model(params) {
    const formModel = this.modelFor('forms.form');
    return { form: formModel, instanceId: params.instance_id };
  }
}
