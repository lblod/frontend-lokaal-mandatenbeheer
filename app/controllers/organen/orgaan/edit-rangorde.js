import Controller from '@ember/controller';

import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class EditRangordeController extends Controller {
  @service mandatarisApi;
  @service router;

  @tracked modalOpen = false;

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
