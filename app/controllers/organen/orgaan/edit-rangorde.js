import Controller from '@ember/controller';

import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { orderMandatarisStructByRangorde } from 'frontend-lmb/utils/rangorde';

export default class EditRangordeController extends Controller {
  @service mandatarisApi;
  @service router;

  @tracked modalOpen = false;
  @tracked orderedMandatarissen = [];
  updatedRangordes = new Set();
  @tracked hasChanges = false;

  @action
  updateOrderedMandatarisList() {
    this.orderedMandatarissen = orderMandatarisStructByRangorde([
      ...this.model.mandatarisStruct,
    ]);
  }

  @action
  trackUpdatedRangorde(rangorde) {
    this.updatedRangordes.add(rangorde);
    this.hasChanges = true;
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
    return !this.hasChanges;
  }

  get tooltipText() {
    return 'Er werden nog geen wijzigingen gevonden.';
  }

  getChangedEntries() {
    const mandatarissen = this.orderedMandatarissen
      .filter((struct) => {
        return this.updatedRangordes.has(struct.rangorde);
      })
      .map((struct) => {
        return {
          mandatarisId: struct.mandataris.id,
          rangorde: struct.rangorde,
        };
      });
    return mandatarissen;
  }

  @action confirmEditRangorde() {
    // Compute entries that changed
    const diff = this.getChangedEntries();
    // Call mandataris-service
    this.closeModal();
    // Reset values
    setTimeout(() => this.router.refresh(), 1000);
  }
}
