import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class MandatarissenPersoonController extends Controller {
  @service router;

  @action
  createMandataris() {
    this.router.transitionTo('under-construction');
  }
}