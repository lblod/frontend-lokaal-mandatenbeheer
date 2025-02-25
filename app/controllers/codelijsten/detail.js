import Controller from '@ember/controller';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { createKeyValueState } from 'frontend-lmb/utils/create-codelist-state';
import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';

export default class CodelijstenDetailController extends Controller {
  @service toaster;
  @service router;

  @tracked isSaving;
  @tracked isDeleting;
  @tracked codelistNameState = {
    name: this.model.codelijst?.label,
    isValid: true,
  };
  @tracked didCodelijstChange;
  @tracked isDeleteModalOpen;

  @tracked isUnsavedChangesModalOpen;
  @tracked savedTransition;

  get title() {
    return this.model.codelijst?.isReadOnly
      ? this.model.codelijst.label
      : 'Bewerk codelijst';
  }

  get hasChanges() {
    return this.didCodelijstChange && this.codelistNameState?.isValid;
  }

  @action
  onCancel() {
    this.model.codelijst.rollbackAttributes();
    this.model.concepten.map((c) => {
      if (!c.id) {
        c.destroyRecord();
        c.save();
        return;
      }
      c.rollbackAttributes();
    });
    this.checkIsCodelistChanged();
    const wasUnsavedChangesModalOpen = this.isUnsavedChangesModalOpen;
    this.isUnsavedChangesModalOpen = false;
    if (!wasUnsavedChangesModalOpen) {
      this.router.transitionTo('codelijsten.overzicht');
    } else {
      this.savedTransition?.retry();
    }
  }

  @action
  checkIsCodelistChanged() {
    const updatedState = createKeyValueState(
      this.model.codelijst,
      this.model.concepten
    );

    this.didCodelijstChange = this.areObjectsDiverging(
      this.model.keyValueState,
      updatedState
    );
    console.log(`codelistNameState?`, this.codelistNameState);
    console.log(`concepts changed?`, this.didCodelijstChange);
  }

  @action
  onCodelistNameUpdated(state) {
    this.codelistNameState = state;
    if (state.isValid) {
      this.checkIsCodelistChanged();
    }
  }

  @action
  async deleteCodelist() {
    this.isDeleting = true;
    await this.deleteConcepts();
    await this.model.codelijst.destroyRecord();
    showSuccessToast(
      this.toaster,
      'Codelijst succesvol verwijderd',
      'Codelijst'
    );
    this.isDeleting = false;
    this.isDeleteModalOpen = false;
    this.router.transitionTo('codelijsten.overzicht');
  }

  async deleteConcepts() {
    await Promise.all(
      this.model.concepten.map(async (concept) => await concept.destroyRecord())
    );
  }

  @action
  async updateCodelist() {
    this.isSaving = true;
    try {
      await this.model.codelijst.save();
      for (const concept of this.model.concepten.toArray()) {
        await concept.save();
      }
      showSuccessToast(
        this.toaster,
        'Codelijst succesvol aangepast.',
        'Codelijst'
      );
    } catch (error) {
      showErrorToast(
        this.toaster,
        'Er ging iets mis bij het opslagen van de codelijst, probeer het later opnieuw.',
        'Codelijst'
      );
    }
    this.isSaving = false;
    this.didCodelijstChange = false;
  }

  areObjectsDiverging(original, updated) {
    let ogKeys = Object.keys(original);
    let keys = Object.keys(updated);

    if (ogKeys.length !== keys.length) {
      return true;
    }

    for (let key of ogKeys) {
      if (!updated[key] || original[key] !== updated[key]) {
        return true;
      }
    }

    return false;
  }
}
