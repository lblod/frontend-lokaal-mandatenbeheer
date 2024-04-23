import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class OrganenEditController extends Controller {
  @service router;

  @action
  closeForm() {
    this.router.transitionTo('organen.orgaan');
  }
}
