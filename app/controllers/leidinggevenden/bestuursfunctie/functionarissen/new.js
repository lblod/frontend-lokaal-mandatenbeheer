import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class LeidinggevendenBestuursfunctieFunctionarissenNewIndexController extends Controller {
  @service router;

  @action
  buildSourceTtl(instanceUri) {
    const bestuursfunctie = this.model.bestuursfunctie;
    const bestuursfunctieUri = bestuursfunctie.get('uri');

    return `
    <${instanceUri}> <http://www.w3.org/ns/org#holds> <${bestuursfunctieUri}> .
    `;
  }

  @action
  create() {
    this.router.transitionTo(
      'leidinggevenden.bestuursfunctie.functionarissen.index'
    );
  }

  @action
  cancel() {
    this.router.transitionTo(
      'leidinggevenden.bestuursfunctie.functionarissen.index'
    );
  }
}
