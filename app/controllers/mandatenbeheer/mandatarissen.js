import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class MandatenbeheerMandatarissenController extends Controller {
  @service router;

  get hasActiveChildRoute() {
    return (
      this.router.currentRouteName.startsWith(
        'mandatenbeheer.mandatarissen.'
      ) && this.router.currentRouteName != 'mandatenbeheer.mandatarissen.index'
    );
  }

  @action
  handleBeheerFractiesClick() {
    this.router.transitionTo('mandatenbeheer.fracties');
  }
}
