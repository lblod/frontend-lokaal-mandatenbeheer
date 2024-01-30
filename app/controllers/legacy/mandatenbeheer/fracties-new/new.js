import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class FormNewController extends Controller {
  @service router;

  // while not technically an 'action' we need this to bind the function to the controller's scope
  @action
  buildSourceTtl(instanceUri) {
    const mandatenbeheer = this.model.mandatenbeheer;
    const bestuurseenheid = mandatenbeheer.bestuurseenheid;
    const bestuursorganen = mandatenbeheer.bestuursorganen;

    const bestuurseenheidUri = bestuurseenheid.get('uri');
    const bestuursOrganenUris = bestuursorganen.map((b) => `<${b.get('uri')}>`);

    return `<${instanceUri}> <http://www.w3.org/ns/org#memberOf> ${bestuursOrganenUris.join(
      ', '
    )} .
    <${instanceUri}> <http://www.w3.org/ns/org#linkedTo> <${bestuurseenheidUri}> . `;
  }

  @action
  onCreate(id) {
    this.router.transitionTo('legacy.mandatenbeheer.fracties-new.instance', id);
  }
}
