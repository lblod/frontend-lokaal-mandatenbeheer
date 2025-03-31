import Controller from '@ember/controller';

import { action } from '@ember/object';
import { service } from '@ember/service';

export default class CustomFormsInstancesNewController extends Controller {
  @service router;

  @action
  onCancel() {
    this.router.location.history.back();
  }

  @action
  onCreate({ instanceId }) {
    const definitionId = this.model.formDefinition.id;
    this.router.transitionTo('custom-forms.instances', definitionId);
    // this.router.transitionTo(
    //   'custom-forms.instances.instance',
    //   definitionId,
    //   instanceId
    // );
  }

  get formContext() {
    return {
      onFormUpdate: () => this.updateForm(),
      formDefinition: this.model.formDefinition,
      isReadOnly: false,
    };
  }
}
