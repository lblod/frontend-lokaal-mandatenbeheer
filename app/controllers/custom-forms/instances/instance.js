import Controller from '@ember/controller';

import { action } from '@ember/object';
import { service } from '@ember/service';

export default class CustomFormsInstancesInstanceController extends Controller {
  @service router;

  @action
  onCancel() {
    this.router.location.history.back();
  }

  @action
  onSave() {
    this.router.refresh();
  }
}
