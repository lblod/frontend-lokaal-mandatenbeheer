import Route from '@ember/routing/route';

import { service } from '@ember/service';
export default class CustomFormsInstancesNewRoute extends Route {
  @service semanticFormRepository;

  async model({ id }) {
    const formDefinition =
      await this.semanticFormRepository.getFormDefinition(id);

    return { formDefinition };
  }
}
