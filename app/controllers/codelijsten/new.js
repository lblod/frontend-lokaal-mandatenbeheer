import Controller from '@ember/controller';

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

  get canSave() {
    return (
      this.isNameValid &&
      this.model.concepten.length > 0 &&
      areConceptLabelsValid(this.model.concepten)
    );
  }

  @action
  async saveCodelist() {
    this.isSaving = true;
    try {
      await this.model.codelijst.save();
      for (const concept of this.model.concepten.toArray()) {
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
    this.isModalOpen = false;
    this.model.codelijst.rollbackAttributes();
    this.model.concepten.toArray().forEach((c) => {
      if (!c.id) {
        return;
      }
      c.rollbackAttributes();
    });

    this.router.transitionTo('codelijsten.overzicht');
  }

  @action
  onConceptChanged(concept) {
    if (!concept) {
      return;
    }

    if (concept.isDeleted) {
      this.model.concepten.removeObject(concept);
    }
  }

  @action
  onCodelistNameUpdated(state) {
    this.isNameValid = state?.isValid;
  }
}
