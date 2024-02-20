import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class OrganenBeheerEditController extends Controller {
  @service router;

  @action
  onSave() {
    this.router.transitionTo('organen.beheer');
  }

  @action
  cancel() {
    this.router.transitionTo('organen.beheer');
  }
}
