import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class CustomFormsInstancesDefinitionRoute extends Route {
  @service store;
  @service formReplacements;
  @service semanticFormRepository;

  queryParams = {
    fullScreenEdit: {},
    isFormExtension: {},
    instanceId: {},
  };

  async model({ id, fullScreenEdit, isFormExtension, instanceId }) {
    let form = await this.store.findRecord('form', id);
    let formInstanceId = form.id;

    if (isFormExtension && fullScreenEdit === 'true') {
      console.log({ instanceId });
      formInstanceId = instanceId;
      const currentFormId = this.formReplacements.getReplacement(id);
      form = await this.semanticFormRepository.getFormDefinition(
        currentFormId,
        true
      );
    }

    return {
      form,
      instanceId: formInstanceId,
      fullScreenEdit: fullScreenEdit && fullScreenEdit === 'true',
    };
  }
}
