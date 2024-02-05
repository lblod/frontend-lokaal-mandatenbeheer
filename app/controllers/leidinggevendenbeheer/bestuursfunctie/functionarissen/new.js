import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class LeidinggevendenbeheerBestuursfunctieFunctionarissenNewIndexController extends Controller {
  @service router;

  @action
  createNewPerson(hasData) {
    hasData
      ? this.router.transitionTo(
          'leidinggevendenbeheer.bestuursfunctie.functionarissen.new-person',
          { queryParams: hasData }
        )
      : this.router.transitionTo(
          'leidinggevendenbeheer.bestuursfunctie.functionarissen.new-person'
        );
  }

  @action
  cancel() {
    this.router.transitionTo(
      'leidinggevendenbeheer.bestuursfunctie.functionarissen.index'
    );
  }
}
