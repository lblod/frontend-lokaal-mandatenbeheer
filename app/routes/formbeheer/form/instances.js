import Route from '@ember/routing/route';

export default class FormInstancesRoute extends Route {
  queryParams = {
    filter: { refreshModel: true },
    page: { refreshModel: false },
    size: { refreshModel: false },
    sort: { refreshModel: true },
  };

  async model() {
    const formModel = this.modelFor('formbeheer.form');
    return { formDefinition: formModel };
  }
}
