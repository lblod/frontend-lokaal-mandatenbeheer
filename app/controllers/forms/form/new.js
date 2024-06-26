import Controller from '@ember/controller';

import { action } from '@ember/object';
import { service } from '@ember/service';

export default class FormNewController extends Controller {
  @service router;

  @action
  onCancel() {
    this.router.location.history.back();
  }

  @action
  onCreate({ instanceId }) {
    const definitionId = this.model.formDefinition.id;
    this.router.transitionTo('forms.form.instance', definitionId, instanceId);
  }
}
