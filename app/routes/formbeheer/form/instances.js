import Route from '@ember/routing/route';

export default class FormInstancesRoute extends Route {
  queryParams = {
    page: { refreshModel: false },
    size: { refreshModel: false },
  };

  async model() {
    const formModel = this.modelFor('legacy.formbeheer.form');
    return { formDefinition: formModel };
  }
}
