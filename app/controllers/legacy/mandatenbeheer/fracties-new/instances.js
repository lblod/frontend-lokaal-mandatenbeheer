import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class FormInstancesController extends Controller {
  @service router;

  @action
  onCreate() {
    this.router.transitionTo('legacy.mandatenbeheer.fracties-new.new');
  }

  @action
  async onRemoveInstance() {
    this.router.refresh();
  }
}
