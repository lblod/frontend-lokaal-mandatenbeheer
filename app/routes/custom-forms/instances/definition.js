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

  async model({ fullScreenEdit, isFormExtension, instanceId }) {
    const parent = this.modelFor('custom-forms.instances');
    const id = parent.form.id;
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

    return {
      form,
      instanceId: formInstanceId,
      fullScreenEdit: isFullScreenAsBool,
      isFormExtension: isFormExtensionAsBool,
    };
  }
}
