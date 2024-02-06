import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class FormRoute extends Route {
  @service store;
  @service router;
  @service session;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model({ id: semanticFormID }) {
    const form = await this.retrieveForm(semanticFormID);

    let definition = this.store.peekRecord('form-definition', semanticFormID);
    if (!definition) {
      definition = this.store.createRecord('form-definition', {
        id: semanticFormID,
        formTtl: form.formTtl,
        metaTtl: form.metaTtl,
        prefix: form.prefix,
      });
    }

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
