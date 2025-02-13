import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { showSuccessToast } from 'frontend-lmb/utils/toasts';

export default class MandatarissenDeleteModal extends Component {
  @service router;
  @service toaster;

  @tracked isDeleting;

  @action
  async delete() {
    this.isDeleting = true;
    await this.args.mandataris.deleteRecord();
    this.isDeleting = false;
    showSuccessToast(
      this.toaster,
      'Mandataris succesvol verwijderd',
      'Mandataris'
    );
    if (this.args.afterDeleteRoute) {
      await this.args.mandataris.save();
      this.router.transitionTo(this.args.afterDeleteRoute);
    }
  }
}
