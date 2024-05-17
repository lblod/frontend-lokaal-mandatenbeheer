import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class MandatarissenPersoonMandatarisController extends Controller {
  @service router;

  @tracked isChangingCurrentSituation;

  get bestuursorganenTitle() {
    return this.model.bestuursorganen
      .map((elem) => elem.isTijdsspecialisatieVan.get('naam'))
      .join(' - ');
  }

  @action
  onMandatarisChanged(newMandataris) {
    this.router.transitionTo('mandatarissen.mandataris', newMandataris.id);
  }

  get persoon() {
    return this.model.mandataris.isBestuurlijkeAliasVan;
  }

  @action
  closeModals() {
    this.isChangingCurrentSituation = false;
  }

  @action
  onUpdateState(newMandataris) {
    this.editMode = null;
    if (
      newMandataris != this.args.mandataris &&
      this.args.onMandatarisChanged
    ) {
      this.args.onMandatarisChanged(newMandataris);
    }
  }
}
