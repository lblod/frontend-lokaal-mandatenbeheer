import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class NewFractiesInstanceRoute extends Route {
  @service store;
  async model(params) {
    const formModel = this.modelFor('legacy.mandatenbeheer.fracties-new');
    return { form: formModel, instanceId: params.instance_id };
  }
}
