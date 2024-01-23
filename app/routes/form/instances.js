import Route from '@ember/routing/route';

export default class FormInstancesRoute extends Route {
  async model() {
    const formModel = this.modelFor('form');
    return { form: formModel };
  }
}
