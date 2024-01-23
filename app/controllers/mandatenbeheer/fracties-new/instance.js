import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class FormInstanceController extends Controller {
  @action
  onSave() {
    this.router.refresh();
  }
}
