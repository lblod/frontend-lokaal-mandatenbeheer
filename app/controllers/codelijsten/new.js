import Controller from '@ember/controller';

import { A } from '@ember/array';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';
import { areConceptLabelsValid } from 'frontend-lmb/utils/codelijst';

export default class CodelijstenNewController extends Controller {
  @service router;
  @service toaster;

  @tracked isSaving;

  @tracked isNameValid;
  @tracked concepten = A();

  @tracked isUnsavedChangesModalOpen;
  @tracked hasChanges;
  @tracked savedTransition;

  get canSave() {
    return (
      this.isNameValid &&
      this.concepten.length >= 1 &&
      areConceptLabelsValid(this.concepten)
    );
  }

  @action
  async saveCodelist() {
    this.isSaving = true;
    try {
      await this.codelijst.save();
      for (const concept of this.concepten.toArray()) {
        await concept.save();
      }
      this.isSaving = false;
      showSuccessToast(
        this.toaster,
        'Codelijst succesvol aangemaakt',
        'Codelijst'
      );
      this.router.transitionTo('codelijsten.overzicht', {
        queryParams: { filter: this.model.codelijst.label },
      });
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
    if (this.canSave) {
      this.isUnsavedChangesModalOpen = true;
    } else {
      this.router.transitionTo('codelijsten.overzicht');
    }
  }

  @action
  discardChanges() {
    this.model.codelijst.destroyRecord();
    this.concepten.toArray().forEach((c) => {
      if (!c.id) {
        return;
      }
      c.destroyRecord();
    });
    this.concepten.clear();
    this.isUnsavedChangesModalOpen = false;
    this.router.transitionTo('codelijsten.overzicht');
  }

  @action
  onConceptChanged(concept) {
    if (!concept) {
      return;
    }

    if (concept.isDeleted) {
      this.concepten.removeObject(concept);
    }
  }

  @action
  onCodelistNameUpdated(state) {
    this.isNameValid = state?.isValid;
  }
}
