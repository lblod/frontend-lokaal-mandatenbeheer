import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class LeidinggevendenbeheerBestuursfunctieFunctionarissenNewIndexController extends Controller {
  @service router;

  @action
  create() {
    this.router.transitionTo(
      'leidinggevendenbeheer.bestuursfunctie.functionarissen.index'
    );
  }

  @action
  cancel() {
    this.router.transitionTo(
      'leidinggevendenbeheer.bestuursfunctie.functionarissen.index'
    );
  }
}
