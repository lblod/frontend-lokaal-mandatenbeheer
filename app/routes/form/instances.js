import Route from '@ember/routing/route';

export default class FormInstancesRoute extends Route {
  async model() {
    const definition = this.modelFor('form');
    const response = await fetch(`/form-content/${definition.id}/instances`);
    const { instances } = await response.json();
    return {
      instances: instances,
      formId: definition.id,
    };
  }
}
