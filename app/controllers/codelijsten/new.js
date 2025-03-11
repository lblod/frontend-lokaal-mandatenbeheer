import Controller from '@ember/controller';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';

export default class CodelijstenNewController extends Controller {
  @service router;
  @service toaster;
  @service store;

  @tracked isSaving;

  @tracked isNameValid;

  @tracked isUnsavedChangesModalOpen;
  @tracked savedTransition;
  @tracked isSaved;

  @action
  async saveCodelist() {
    this.isSaving = true;
    try {
      await this.model.codelijst.save();
      this.isSaving = false;
      showSuccessToast(
        this.toaster,
        'Codelijst succesvol aangemaakt',
        'Codelijst'
      );
      this.isSaved = true;
      this.router.transitionTo('codelijsten.detail', this.model.codelijst.id);
    } catch (error) {
      showErrorToast(
        this.toaster,
        'Codelijst kon niet aangemaakt worden. Probeer het later opnieuw.',
        'Codelijst'
      );
    }
  }

  @action
  onCancel() {
    if (this.isNameValid) {
      this.isUnsavedChangesModalOpen = true;
    } else {
      this.router.transitionTo('codelijsten.overzicht');
    }
  }

  @action
  discardChanges() {
    this.store.unloadRecord(this.model.codelijst);
    this.isUnsavedChangesModalOpen = false;
    this.router.transitionTo('codelijsten.overzicht');
  }

  @action
  onCodelistNameUpdated(state) {
    this.model.codelijst.label = state?.name;
    this.isNameValid = !!state?.isValid;
  }
}
