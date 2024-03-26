import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class FractiesEditController extends Controller {
  @service router;

  @action
  onSave() {
    this.router.transitionTo('organen.fracties');
  }

  @action
  cancel() {
    this.router.transitionTo('organen.fracties');
  }
}
