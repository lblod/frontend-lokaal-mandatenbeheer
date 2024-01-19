import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class FormInstancesController extends Controller {
  @service router;

  @action
  onCreate() {
    this.router.transitionTo('form.new', this.model.form.definition.id);
  }

  @action
  async onRemoveInstance() {
    this.router.refresh();
  }
}
