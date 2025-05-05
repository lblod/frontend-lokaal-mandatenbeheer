import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class MandatarissenPersoonIndexRoute extends Route {
  @service store;
  @service customForms;
  @service semanticFormRepository;

  async model() {
    const parentModel = await this.modelFor('mandatarissen.persoon');
    const usages = await this.customForms.getInstanceUsage(
      parentModel.persoon.uri
    );
    await Promise.all(
      (usages || []).map(async (usage) => {
        const def = await this.semanticFormRepository.getFormDefinition(
          usage.formId
        );
        usage.form = def;
      })
    );
    return {
      persoon: parentModel.persoon,
      usages: usages,
    };
  }
}
