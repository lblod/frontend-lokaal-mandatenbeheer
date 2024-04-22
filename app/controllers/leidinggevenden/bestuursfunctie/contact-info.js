import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class LeidinggevendenBestuursfunctieContactInfoController extends Controller {
  @service router;

  @action
  save() {
    this.router.transitionTo(
      'leidinggevenden.bestuursfunctie.functionarissen',
      this.model.bestuursfunctie.id
    );
  }

  // TODO before a dialog box was shown when leaving the form with inserted data without saving.
  // might be nice to add this with forms as well.
  @action
  cancel() {
    this.router.transitionTo(
      'leidinggevenden.bestuursfunctie.functionarissen',
      this.model.bestuursfunctie.id
    );
  }
}
