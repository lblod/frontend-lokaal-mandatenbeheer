import Controller from '@ember/controller';

import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { orderMandatarisStructByRangorde } from 'frontend-lmb/utils/rangorde';
import moment from 'moment';

export default class EditRangordeController extends Controller {
  queryParams = ['date'];
  @service rangordeApi;
  @service router;

  @tracked loading = false;
  @tracked modalOpen = false;
  @tracked correcting = false;
  @tracked date = null;
  @tracked orderedMandatarissen = [];
  @tracked interceptedTransition = null;

  @action
  updateOrderedMandatarisList() {
    this.orderedMandatarissen = orderMandatarisStructByRangorde([
      ...this.model.mandatarisStruct,
    ]);
  }

  get hasChanges() {
    return this.changedEntries.length > 0;
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

  get momentizedDate() {
    return this.date && moment(this.date).toDate();
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
      .filter((struct) => struct.mandataris.rangorde !== struct.rangorde)
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
    this.loading = true;
    const diff = this.changedEntries;
    await this.rangordeApi.updateRangordes(diff, this.correcting, this.date);
    this.closeModal();
    this.loading = false;
    // so we can tell the route it's ok to refresh now
    this.saved = true;
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
