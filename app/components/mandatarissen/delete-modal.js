import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';

export default class MandatarissenDeleteModal extends Component {
  @service router;
  @service toaster;

  @tracked isDeleting;

  @action
  async delete() {
    this.isDeleting = true;
    try {
      this.args.mandataris.deleteRecord();
      await this.args.mandataris.save();
      showSuccessToast(
        this.toaster,
        'Mandataris succesvol verwijderd',
        'Mandataris'
      );
      this.router.transitionTo(this.args.afterDeleteRoute);
    } catch (error) {
      showErrorToast(
        this.toaster,
        'De mandataris kon niet verwijderd worden, probeer later opnieuw.',
        'Mandataris'
      );
    }
    this.isDeleting = false;
    this.args.onClose();
  }

  get isClosable() {
    return !!this.args.onClose;
  }
}
