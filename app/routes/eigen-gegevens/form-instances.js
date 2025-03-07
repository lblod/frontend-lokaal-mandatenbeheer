import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class EigenGegevensDFormInstancesRoute extends Route {
  @service semanticFormRepository;

  queryParams = {
    filter: { refreshModel: true },
    page: { refreshModel: false },
    size: { refreshModel: false },
    sort: { refreshModel: true },
    formName: { refreshModel: true },
  };

  async model(params) {
    const formDefinition = await this.semanticFormRepository.getFormDefinition(
      params.formName
    );
    const headerLabels = await this.semanticFormRepository.getHeaderLabels(
      formDefinition.id
    );

    return {
      formDefinition,
      headerLabels,
    };
  }
}
