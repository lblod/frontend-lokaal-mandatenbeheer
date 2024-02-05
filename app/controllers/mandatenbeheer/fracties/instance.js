import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class FormInstanceController extends Controller {
  @service router;

  @action
  onSave() {
    this.router.refresh();
  }
}
