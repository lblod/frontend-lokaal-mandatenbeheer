import Controller from '@ember/controller';

import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { orderMandatarisStructByRangorde } from 'frontend-lmb/utils/rangorde';

export default class EditRangordeController extends Controller {
  queryParams = ['date'];
  @service rangordeApi;
  @service router;

  @tracked modalOpen = false;
  @tracked correcting = false;
  @tracked date = new Date();
  @tracked orderedMandatarissen = [];
  @tracked interceptedTransition = null;
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
  closeModal() {
    this.modalOpen = false;
  }

  get modalTitle() {
    if (this.correcting) {
      return 'Corrigeer Rangorde';
    } else {
      return 'Wijzig Rangorde';
    }
  }

  get openModalDisabled() {
    return !this.hasChanges;
  }

  get tooltipText() {
    return 'Er werden nog geen wijzigingen gevonden.';
  }

  get confirmDisabled() {
    return !this.correcting && !this.date;
  }

  get changedEntries() {
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

  @action
  async changeRangorde() {
    const diff = this.changedEntries;
    await this.rangordeApi.updateRangordes(diff, this.correcting, this.date);
    this.closeModal();
    this.updatedRangordes.clear();
    this.hasChanges = false;
    this.router.refresh();
  }

  @action confirmLoseChanges() {
    this.interceptedTransition.retry();
    this.interceptedTransition = null;
  }

  @action cancelLoseChanges() {
    this.interceptedTransition = null;
  }
  @action startCorrectingRangorde() {
    this.modalOpen = true;
    this.correcting = true;
  }

  @action startChangeRangorde() {
    this.modalOpen = true;
    this.correcting = false;
  }
}
