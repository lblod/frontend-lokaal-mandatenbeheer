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
  @tracked isConceptenChanged;
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
    return (
      this.hasDeletions ||
      this.isConceptenChanged ||
      (this.codelistNameState?.isValid &&
        this.model.ogCodelistName !== this.codelistNameState?.name)
    );
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
  onConceptChanged(concept) {
    const updatedState = createKeyValueState(
      this.model.codelijst,
      this.model.concepten
    );

    this.isConceptenChanged =
      !this.model.keyValueState[concept.id] ||
      this.model.keyValueState[concept.id] !== updatedState[concept.id];
  }

  @action
  onCodelistNameUpdated(state) {
    this.codelistNameState = state;
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
    this.isConceptenChanged = false;
  }
}
