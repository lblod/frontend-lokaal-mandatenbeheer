import Controller from '@ember/controller';

import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { orderMandatarisStructByRangorde } from 'frontend-lmb/utils/rangorde';

export default class EditRangordeController extends Controller {
  @service mandatarisApi;
  @service router;

  @tracked modalOpen = false;

  get orderedMandatarissen() {
    return orderMandatarisStructByRangorde([...this.model.mandatarisStruct]);
  }

  @action
  openModal() {
    this.modalOpen = true;
  }

  @action
  closeModal() {
    this.modalOpen = false;
  }

  get openModalDisabled() {
    return true;
  }

  get tooltipText() {
    return 'Er werden nog geen wijzigingen gevonden.';
  }

  @action confirmEditRangorde() {
    // Call mandataris-service
    this.closeModal();
    // Reset values
    setTimeout(() => this.router.refresh(), 1000);
  }
}
