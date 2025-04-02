import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class MandatarissenEditModalComponent extends Component {
  @tracked isSecondModalOpen = false;

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
  saveForm() {
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
