import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class MandatarissenPersoonController extends Controller {
  @service router;
  @service store;

  @tracked createMode = false;

  @action
  createMandataris() {
    this.router.transitionTo('under-construction');
  }
}
