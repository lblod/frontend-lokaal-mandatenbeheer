import Route from '@ember/routing/route';

export default class CustomFormsInstancesNewRoute extends Route {
  async model() {
    const formModel = this.modelFor('custom-forms.instances');

    return formModel;
  }
}
