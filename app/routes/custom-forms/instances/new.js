import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class CustomFormsInstancesNewRoute extends Route {
  @service semanticFormRepository;

  async model() {
    const parent = this.modelFor('custom-forms.instances');
    const formDefinition = await this.semanticFormRepository.getFormDefinition(
      parent.form.id
    );

    return { formDefinition };
  }
}
