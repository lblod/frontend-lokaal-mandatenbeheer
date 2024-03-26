import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class FormInstancesController extends Controller {
  queryParams = ['page', 'size'];

  @service router;
  @tracked page = 0;
  size = 10;

  @action
  onCreate() {
    this.router.transitionTo(
      'formbeheer.form.new',
      this.model.formDefinition.id
    );
  }

  @action
  async onRemoveInstance() {
    this.router.refresh();
  }
}
