import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class MandatarissenMandatarisController extends Controller {
  @service router;

  get bestuursorganenTitle() {
    let displayText =
      this.model.bestuursorganen[0].isTijdsspecialisatieVan.get('naam');
    for (let i = 1; i < this.model.bestuursorganen.length; i++) {
      displayText += ` - ${this.model.bestuursorganen[1].isTijdsspecialisatieVan.get(
        'naam'
      )}`;
    }
    return displayText;
  }

  @action
  onMandatarisChanged(newMandataris) {
    this.router.transitionTo('mandatarissen.mandataris', newMandataris.id);
  }
}
