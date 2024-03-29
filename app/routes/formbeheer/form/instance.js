import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class FormInstanceRoute extends Route {
  @service store;
  async model(params) {
    const formModel = this.modelFor('formbeheer.form');
    return { form: formModel, instanceId: params.instance_id };
  }
}
