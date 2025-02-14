import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { timeout } from 'ember-concurrency';

import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';
import { RESOURCE_CACHE_TIMEOUT } from 'frontend-lmb/utils/constants';

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
      await timeout(RESOURCE_CACHE_TIMEOUT);
      showSuccessToast(
        this.toaster,
        'Mandataris succesvol verwijderd',
        'Mandataris'
      );
      this.router.transitionTo(this.args.afterDeleteRoute);
    } catch (error) {
      showErrorToast(
        this.toaster,
        'Oeps er liep iets mis, kon mandataris niet verwijderen',
        'Mandataris'
      );
    }
    this.isDeleting = false;
    this.args.onClose();
  }
}
