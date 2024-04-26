import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class FormNewRoute extends Route {
  @service store;
  async model() {
    const formModel = this.modelFor('forms.form');
    return { formDefinition: formModel };
  }
}
