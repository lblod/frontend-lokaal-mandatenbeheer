import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class OrganenOrgaanCardListComponent extends Component {
  @service
  router;

  @action
  goToOrgaan(targetOrgaan) {
    this.router.transitionTo('organen.orgaan.index', targetOrgaan.id);
  }
}
