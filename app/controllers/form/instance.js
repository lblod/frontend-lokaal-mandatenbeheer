import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class FormInstanceController extends Controller {
  @service router;

  @action
  onSave() {
    this.router.refresh();
  }
}
