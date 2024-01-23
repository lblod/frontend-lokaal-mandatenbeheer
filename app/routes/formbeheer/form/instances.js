import Route from '@ember/routing/route';

export default class FormInstancesRoute extends Route {
  async model() {
    const formModel = this.modelFor('formbeheer.form');
    return { form: formModel };
  }
}
