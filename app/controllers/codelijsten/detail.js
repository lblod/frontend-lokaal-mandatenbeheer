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
  @tracked codelistNameState;
  @tracked didCodelijstChange;
  @tracked isDeleteModalOpen;

  get title() {
    return this.model.codelijst?.isReadOnly
      ? this.model.codelijst.label
      : 'Bewerk codelijst';
  }

  get hasDeletions() {
    return this.model.concepten.filter((c) => c.isDeleted).length >= 1;
  }
  get hasChanges() {
    return this.hasDeletions || this.didCodelijstChange;
  }

  @action
  onCancel() {
    this.model.codelijst.rollbackAttributes();
    this.model.concepten.map((c) => {
      if (!c.id) {
        return;
      }
      c.rollbackAttributes();
    });
    this.router.transitionTo('codelijsten.overzicht');
  }

  @action
  onConceptChanged() {
    const updatedState = createKeyValueState(
      this.model.codelijst,
      this.model.concepten
    );

    this.didCodelijstChange = this.areObjectsDiverging(
      this.model.keyValueState,
      updatedState
    );
  }

  @action
  onCodelistNameUpdated(state) {
    if (state.isValid) {
      this.onConceptChanged();
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
