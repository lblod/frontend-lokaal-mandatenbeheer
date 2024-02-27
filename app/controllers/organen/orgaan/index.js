import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class OrganenOrgaanIndexController extends Controller {
  @service router;

  @action
  edit() {
    this.router.transitionTo('organen.beheer.edit', this.model.instanceId);
  }
}
