import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class MandatenbeheerBestuursorganenNewController extends Controller {
  @service router;

  @action
  buildSourceTtl(instanceUri) {
    const bestuurseenheid = this.model.bestuurseenheid;

    return `<${instanceUri}> <http://data.vlaanderen.be/ns/besluit#bestuurt> <${bestuurseenheid.uri}> .`;
  }

  @action
  cancel() {
    this.router.transitionTo('organen.beheer');
  }

  @action
  onCreate({ instanceId }) {
    this.router.transitionTo('organen.beheer.edit', instanceId);
  }
}
