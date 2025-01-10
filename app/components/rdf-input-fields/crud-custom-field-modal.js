import Component from '@glimmer/component';

import { action } from '@ember/object';

export default class RdfInputFieldCrudCustomFieldModalComponent extends Component {
  @action
  closeModal() {
    if (this.args.onCloseModal) {
      this.args.onCloseModal();
    }
  }

  get title() {
    if (this.args.isCreating) {
      return 'Voeg een veld toe';
    }

    return 'Pas een veld aan';
  }
}
