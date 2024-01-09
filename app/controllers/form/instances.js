import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class FormInstancesController extends Controller {
  @service router;

  @action
  createNewInstance() {
    this.router.transitionTo('form.new', this.model.formId);
  }
}
