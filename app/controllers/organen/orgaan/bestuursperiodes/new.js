import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class OrganenOrgaanBestuursperiodesNewController extends Controller {
  @service router;

  // while not technically an 'action' we need this to bind the function to the controller's scope
  @action
  buildSourceTtl(instanceUri) {
    const bestuursorgaanUri = this.model.bestuursorgaan.get('uri');

    return `<${instanceUri}> <http://data.vlaanderen.be/ns/mandaat#isTijdspecialisatieVan> <${bestuursorgaanUri}>.`;
  }

  @action
  onCreate() {
    this.router.transitionTo('organen.orgaan.mandatarissen');
  }

  @action
  cancel() {
    this.router.transitionTo('organen.orgaan.mandatarissen');
  }
}
