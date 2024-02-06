import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class LeidinggevendenbeheerBestuursfunctieFunctionarissenEditController extends Controller {
  @service router;

  // TODO make sure filled in data is reset after cancelling
  @action
  cancel() {
    this.router.transitionTo(
      'leidinggevendenbeheer.bestuursfunctie.functionarissen'
    );
  }
}
