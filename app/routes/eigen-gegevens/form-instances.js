import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class EigenGegevensDFormInstancesRoute extends Route {
  @service formReplacements;
  @service semanticFormRepository;

  queryParams = {
    filter: { refreshModel: true },
    page: { refreshModel: false },
    size: { refreshModel: false },
    sort: { refreshModel: true },
    formName: { refreshModel: true },
  };

  async model(params) {
    const currentFormId = await this.formReplacements.getReplacement(
      params.formName
    );
    const formDefinition = await this.semanticFormRepository.getFormDefinition(
      currentFormId,
      true
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
