import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OrganenIndexController extends Controller {
  @service router;

  @action
  goToOrgaan(id) {
    this.router.transitionTo('organen.orgaan.mandatarissen', id);
  }

  @action
  beheerOrganen() {
    this.router.transitionTo('organen.beheer');
  }
}
