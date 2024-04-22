import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class LeidinggevendenBestuursfunctieFunctionarissenEditController extends Controller {
  @service router;

  @action
  save() {
    this.router.transitionTo('leidinggevenden.bestuursfunctie.functionarissen');
  }

  @action
  cancel() {
    this.router.transitionTo('leidinggevenden.bestuursfunctie.functionarissen');
  }
}
