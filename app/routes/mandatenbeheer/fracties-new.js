import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class FormRoute extends Route {
  @service store;
  @service router;
  @service session;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model() {
    const form = await this.retrieveForm('fractie');

    let definition = this.store.peekRecord('form-definition', 'fractie');
    if (!definition) {
      definition = this.store.createRecord('form-definition', {
        id: 'fractie',
        formTtl: form.formTtl,
        metaTtl: form.metaTtl,
      });
    }

    return {
      definition,
      prefix: form.prefix,
    };
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
