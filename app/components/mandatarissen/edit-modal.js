import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';

export default class MandatarissenEditModalComponent extends Component {
  @service toaster;

  @tracked isSecondModalOpen = false;
  @tracked reasonForChangeOptions = ['Update state', 'Corrigeer fouten'];
  @tracked reasonForChange;

  get hasChanges() {
    return true;
  }

  get disabled() {
    return !this.hasChanges;
  }

  get toolTipText() {
    return 'Er zijn geen wijzigingen om op te slaan.';
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
