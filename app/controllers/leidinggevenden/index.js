import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class LeidinggevendenIndexController extends Controller {
  @service router;

  page = 0;
  size = 20;

  @action
  displayBestuursfunctie(bestuursfunctie) {
    this.router.transitionTo(
      'leidinggevenden.bestuursfunctie.functionarissen',
      bestuursfunctie.id
    );
  }
}
