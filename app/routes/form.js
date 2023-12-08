import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class FormRoute extends Route {
  @service store;
  @service router;

  beforeModel() {
    return this.router.replaceWith('form.new');
  }

  async model({ id: semanticFormID }) {
    const form = await this.retrieveForm(semanticFormID);

    return this.store.createRecord('form-definition', {
      id: semanticFormID,
      formTtl: form.formTtl,
      metaTtl: form.metaTtl,
    });
  }

  async retrieveForm(id) {
    const response = await fetch(`/form-content/${id}`);
    const form = await response.json();
    return form;
  }
}
