import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class CustomFormsInstancesIndexRoute extends Route {
  @service store;
  @service session;
  @service semanticFormRepository;
  @service customForms;

  queryParams = {
    filter: { refreshModel: true },
    page: { refreshModel: false },
    size: { refreshModel: false },
    sort: { refreshModel: true },
  };

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model({ id }) {
    const form = await this.store.findRecord('form', id);
    const formDefinition =
      await this.semanticFormRepository.getFormDefinition(id);
    const usage = await this.customForms.getFormDefinitionUsageCount(id);

    return {
      form,
      formDefinition,
      headerLabels: await this.semanticFormRepository.getHeaderLabels(form.id),
      usage,
    };
  }
}
