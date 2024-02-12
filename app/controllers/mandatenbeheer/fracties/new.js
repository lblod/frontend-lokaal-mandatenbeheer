import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class MandatenbeheerFractiesNewController extends Controller {
  @service router;

  // while not technically an 'action' we need this to bind the function to the controller's scope
  @action
  buildSourceTtl(instanceUri) {
    const mandatenbeheer = this.model.mandatenbeheer;
    const bestuurseenheid = mandatenbeheer.bestuurseenheid;
    const bestuursorganen = mandatenbeheer.bestuursorganen;

    const bestuurseenheidUri = bestuurseenheid.get('uri');
    const bestuursOrganenUris = bestuursorganen.map((b) => `<${b.get('uri')}>`);
    const defaultFractieTypeUri = this.model.defaultFractieType.get('uri');

    return `<${instanceUri}> <http://www.w3.org/ns/org#memberOf> ${bestuursOrganenUris.join(
      ', '
    )} .
    <${instanceUri}> <http://www.w3.org/ns/org#linkedTo> <${bestuurseenheidUri}> .
    <${instanceUri}> <http://mu.semte.ch/vocabularies/ext/isFractietype> <${defaultFractieTypeUri}> .`;
  }

  @action
  onCreate({ instanceId }) {
    this.router.transitionTo('mandatenbeheer.fracties.edit', instanceId);
  }

  @action
  cancel() {
    this.router.transitionTo('mandatenbeheer.fracties');
  }
}
