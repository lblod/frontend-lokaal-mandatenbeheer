import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class MandatarissenPersoonIndexController extends Controller {
  @service router;

  @action
  onSave() {
    this.router.refresh();
  }
}
