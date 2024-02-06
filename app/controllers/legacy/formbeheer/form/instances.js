import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class FormInstancesController extends Controller {
  @service router;

  @action
  onCreate() {
    this.router.transitionTo(
      'legacy.formbeheer.form.new',
      this.model.formDefinition.id
    );
  }

  @action
  async onRemoveInstance() {
    this.router.refresh();
  }
}
