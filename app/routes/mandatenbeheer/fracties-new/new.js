import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class NewFractiesNewRoute extends Route {
  @service store;
  async model() {
    const formModel = this.modelFor('mandatenbeheer.fracties-new');
    return {
      form: formModel,
      mandatenbeheer: this.modelFor('mandatenbeheer'),
    };
  }
}
