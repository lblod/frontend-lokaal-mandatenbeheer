import Component from '@glimmer/component';

import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';
import { MANDATARIS_VERHINDERD_STATE } from 'frontend-lmb/utils/well-known-uris';

export default class MandatarisEditFormComponent extends Component {
  @service toaster;
  @service mandatarisStatus;

  @tracked status;
  @tracked statusOptions = [];
  @tracked rangorde;

  @tracked isSecondModalOpen = false;
  @tracked reasonForChangeOptions = ['Update state', 'Corrigeer fouten'];
  @tracked reasonForChange;

  constructor() {
    super(...arguments);
    this.load.perform();
  }

  load = task({ drop: true }, async () => {
    this.mandaat = await this.args.mandataris.bekleedt;
    this.status = this.args.mandataris.status;
    this.statusOptions = await this.mandatarisStatus.getStatusOptionsForMandate(
      this.args.mandataris.bekleedt
    );
    this.rangorde = this.args.mandataris.rangorde;
  });

  get hasChanges() {
    return true;
  }

  get disabled() {
    return !this.hasChanges;
  }

  get toolTipText() {
    return 'Er zijn geen wijzigingen om op te slaan.';
  }

  get showRangordeField() {
    return (
      this.mandaat.get('hasRangorde') &&
      this.status?.get('uri') !== MANDATARIS_VERHINDERD_STATE
    );
  }

  get mandaatLabel() {
    return this.mandaat.rangordeLabel;
  }

  get rangordePlaceholder() {
    return `Eerste ${this.mandaatLabel}`;
  }

  @action
  updateStatus(status) {
    this.status = status;
  }

  @action
  updateRangorde(rangordeAsString) {
    this.rangorde = rangordeAsString;
  }

  @action
  confirmMandatarisChanges() {
    this.args.onClose();
    this.isSecondModalOpen = true;
  }

  @action
  selectReasonForChange(reason) {
    this.reasonForChange = reason;
  }

  @action
  saveForm() {
    if (this.reasonForChange == 'Corrigeer fouten') {
      // Add corrigeer fouten logic here
      console.log('Corrigeer fouten');
    } else if (this.reasonForChange == 'Update state') {
      // Add update state logic here
      console.log('Update state');
    } else {
      showErrorToast(
        this.toaster,
        'Geen geldige reden voor aanpassing geselecteerd'
      );
      return;
    }
    showSuccessToast(this.toaster, 'De mandataris werd succesvol aangepast');
    this.reasonForChange = null;
    this.isSecondModalOpen = false;
  }

  @action
  cancel() {
    this.args.onClose();
  }

  @action
  cancelSecondModal() {
    this.isSecondModalOpen = false;
  }
}
