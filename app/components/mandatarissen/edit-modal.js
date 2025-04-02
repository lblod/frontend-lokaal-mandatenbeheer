import Component from '@glimmer/component';

import { action } from '@ember/object';

export default class MandatarissenEditModalComponent extends Component {
  get hasChanges() {
    return false;
  }

  get disabled() {
    return !this.hasChanges;
  }

  get toolTipText() {
    return 'Er zijn geen wijzigingen om op te slaan.';
  }

  @action
  cancel() {
    this.args.onClose();
  }
}
