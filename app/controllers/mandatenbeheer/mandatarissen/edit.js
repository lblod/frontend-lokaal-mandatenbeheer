import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class MandatenbeheerMandatarissenEditController extends Controller {
  @service router;

  @tracked createMode = false;

  @action
  createMandataris() {
    this.createMode = !this.createMode;
    // TODO add create mandataris logic here.
  }

  @action
  cancel() {
    this.router.transitionTo('mandatenbeheer.mandatarissen');
  }
}
