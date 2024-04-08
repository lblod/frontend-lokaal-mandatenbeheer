import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class FormInstanceController extends Controller {
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
