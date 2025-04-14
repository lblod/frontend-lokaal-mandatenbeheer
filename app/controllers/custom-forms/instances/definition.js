import Controller from '@ember/controller';

import { action } from '@ember/object';

export default class CustomFormsInstancesDefinitionController extends Controller {
  @action
  onCancel() {
    alert('todo on cancel');
  }

  @action
  onSave() {
    alert('todo on save');
  }
}
