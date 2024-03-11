import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class MandatarissenMandatarisController extends Controller {
  @service router;

  get bestuursorganenTitle() {
    return this.model.bestuursorganen
      .map((elem) => elem.isTijdsspecialisatieVan.get('naam'))
      .join(' - ');
  }

  @action
  onMandatarisChanged(newMandataris) {
    this.router.transitionTo('mandatarissen.mandataris', newMandataris.id);
  }
}
