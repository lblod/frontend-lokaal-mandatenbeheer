import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { registerFormFields } from '@lblod/ember-submission-form-fields';
import RdfInstanceSelectorComponent from 'frontend-lmb/components/rdf-input-fields/instance-selector';

export default class FormRoute extends Route {
  @service store;
  @service router;
  @service session;

  constructor() {
    super(...arguments);
    this.registerCustomFormFields();
  }

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model({ id: semanticFormID }) {
    const form = await this.retrieveForm(semanticFormID);

    const definition = this.store.createRecord('form-definition', {
      id: semanticFormID,
      formTtl: form.formTtl,
      metaTtl: form.metaTtl,
    });

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

  registerCustomFormFields() {
    registerFormFields([
      {
        displayType: 'http://lblod.data.gift/display-types/instanceSelector',
        edit: RdfInstanceSelectorComponent,
      },
    ]);
  }
}
