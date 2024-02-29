import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class MandatarissenMandatarisController extends Controller {
  @service router;

  @action
  onMandatarisChanged(newMandataris) {
    this.router.transitionTo('mandatarissen.mandataris', newMandataris.id);
  }
}
