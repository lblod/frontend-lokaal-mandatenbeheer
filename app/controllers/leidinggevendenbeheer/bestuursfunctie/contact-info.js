import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class LeidinggevendenbeheerBestuursfunctieContactInfoController extends Controller {
  @service router;

  @tracked showConfirmationDialog = false;

  get isDirty() {
    return (
      this.model.info.hasDirtyAttributes ||
      this.model.info.adres.get('hasDirtyAttributes')
    );
  }

  exit() {
    this.showConfirmationDialog = false;
    this.router.transitionTo(
      'leidinggevendenbeheer.bestuursfunctie.functionarissen',
      this.model.bestuursfunctie.id
    );
  }

  @action
  cancel() {
    if (!this.isDirty) this.exit();
    else this.showConfirmationDialog = true;
  }
}
