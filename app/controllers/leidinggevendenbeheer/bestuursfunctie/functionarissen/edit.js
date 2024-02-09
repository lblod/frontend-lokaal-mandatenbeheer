import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class LeidinggevendenbeheerBestuursfunctieFunctionarissenEditController extends Controller {
  @service router;

  @action
  save() {
    this.router.transitionTo(
      'leidinggevendenbeheer.bestuursfunctie.functionarissen'
    );
  }

  @action
  cancel() {
    this.router.transitionTo(
      'leidinggevendenbeheer.bestuursfunctie.functionarissen'
    );
  }
}
