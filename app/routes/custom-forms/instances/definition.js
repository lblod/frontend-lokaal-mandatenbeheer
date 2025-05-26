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
    let form = null;
    let formInstanceId = null;
    const isFullScreenAsBool = !!(fullScreenEdit && fullScreenEdit === 'true');
    const isFormExtensionAsBool = !!(
      isFormExtension && isFormExtension === 'true'
    );

    if (!isFormExtensionAsBool) {
      form = await this.store.findRecord('form', id);
      formInstanceId = form.id;
    }

    if (isFormExtensionAsBool && isFullScreenAsBool) {
      formInstanceId = instanceId;
      const currentFormId = this.formReplacements.getReplacement(id);
      form = await this.semanticFormRepository.getFormDefinition(
        currentFormId,
        true
      );
    }
    console.log(`ext?`, isFormExtensionAsBool);
    return {
      form,
      instanceId: formInstanceId,
      fullScreenEdit: isFullScreenAsBool,
      isFormExtension: isFormExtensionAsBool,
    };
  }
}
