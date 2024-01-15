import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class FormInstancesRoute extends Route {
  async model() {
    const formModel = this.modelFor('form');
    const id = formModel.definition.id;
    const response = await fetch(`/form-content/${id}/instances`);
    if (!response.ok) {
      let error = new Error(response.statusText);
      error.status = response.status;
      throw error;
    }
    const { instances } = await response.json();
    return {
      instances: instances,
      formId: id,
    };
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
