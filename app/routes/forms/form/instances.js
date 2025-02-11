import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class FormInstancesRoute extends Route {
  @service semanticFormRepository;

  queryParams = {
    filter: { refreshModel: true },
    page: { refreshModel: false },
    size: { refreshModel: false },
    sort: { refreshModel: true },
  };

  async model() {
    const formModel = this.modelFor('forms.form');

    return {
      formDefinition: formModel,
      headerLabels: await this.semanticFormRepository.getHeaderLabels(
        formModel.id
      ),
    };
  }
}
