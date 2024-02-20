import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OrganenIndexController extends Controller {
  @service router;

  @action
  goToOrgaan(targetOrgaan) {
    this.router.transitionTo('organen.orgaan.mandatarissen', targetOrgaan.id);
  }

  @action
  beheerOrganen() {
    this.router.transitionTo('organen.beheer');
  }
}
