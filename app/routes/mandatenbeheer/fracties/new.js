import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MandatenbeheerFractiesNewRoute extends Route {
  @service store;

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

  async model() {
    const formId = 'fractie-new';
    const definitionModel = 'form-definition';
    const { formTtl, metaTtl, prefix } = await this.retrieveForm(formId);

    let definition = this.store.peekRecord(definitionModel, formId);
    if (!definition) {
      definition = this.store.createRecord(definitionModel, {
        id: formId,
        formTtl,
        metaTtl,
      });
    }

    const mandatenbeheerFracties = this.modelFor('mandatenbeheer.fracties');

    return {
      form: {
        definition,
        prefix,
      },
      ...mandatenbeheerFracties,
    };
  }
}
