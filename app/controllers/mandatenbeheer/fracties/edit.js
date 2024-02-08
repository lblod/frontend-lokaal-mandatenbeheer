import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class MandatenbeheerFractiesEditController extends Controller {
  @service router;

  @action
  onSave() {
    this.router.transitionTo('mandatenbeheer.fracties');
  }

  @action
  cancel() {
    this.router.transitionTo('mandatenbeheer.fracties');
  }
}
