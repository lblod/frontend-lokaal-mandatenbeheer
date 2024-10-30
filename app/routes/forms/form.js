import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class FormRoute extends Route {
  @service store;
  @service router;
  @service session;
  @service semanticFormRepository;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model({ id: semanticFormID }) {
    const definition =
      await this.semanticFormRepository.getFormDefinition(semanticFormID);

    return definition;
  }

  async retrieveForm(id) {
    const response = await fetch(`/form-content/${id}`);
    if (!response.ok) {
      let error = new Error(response.statusText);
      error.status = response.status;
      throw error;
    }
    const form = await response.json();
    return form;
  }
}
