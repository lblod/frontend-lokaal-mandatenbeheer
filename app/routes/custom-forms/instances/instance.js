import Route from '@ember/routing/route';

import { service } from '@ember/service';

import { showWarningToast } from 'frontend-lmb/utils/toasts';

export default class CustomFormsInstancesInstanceRoute extends Route {
  @service router;
  @service toaster;

  async model(params) {
    const parent = this.modelFor('custom-forms.instances.index');

    return { form: parent?.formDefinition, instanceId: params.instance_id };
  }

  afterModel(model) {
    if (!model.form) {
      showWarningToast(
        this.toaster,
        `Er liep iets mis met het ophalen van de gegevens voor formulier met id: ${model.instanceId}`
      );
      this.router.transitionTo('custom-forms');
    }
  }
}
