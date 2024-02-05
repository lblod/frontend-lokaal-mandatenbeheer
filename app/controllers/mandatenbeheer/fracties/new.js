import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class MandatenbeheerFractiesNewController extends Controller {
  @service router;

  @action
  cancel() {
    this.router.transitionTo('mandatenbeheer.fracties');
  }
}
