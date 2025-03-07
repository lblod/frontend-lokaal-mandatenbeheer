import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';

export default class CodelijstConceptRow extends Component {
  @service store;
  @service toaster;

  @tracked label;

  @tracked isEditing;
  @tracked errorMessage =
    'Label voor een concept moet minstens 2 karakters lang zijn.';

  constructor() {
    super(...arguments);
    if (this.args.concept) {
      this.label = this.args.concept.label;
    }
  }

  @action
  updateConceptLabel(event) {
    this.label = event.target?.value;
  }

  @action
  async saveChanges() {
    if (!this.canSaveLabel) {
      return;
    }

    this.errorMessage = null;
    this.isEditing = false;

    if (this.args.concept.label === this.label?.trim()) {
      return;
    }

    try {
      this.args.concept.label = this.label?.trim();
      await this.args.concept.save();
      showSuccessToast(this.toaster, 'Concept succesvol geüpdatet', 'Concept');
    } catch (error) {
      showErrorToast(
        this.toaster,
        'Kon concept niet updaten. Probeer het later opnieuw.',
        'Concept'
      );
    }
  }

  @action
  async discardChanges() {
    this.isEditing = false;
    this.label = this.args.concept.label?.trim() ?? 'Optie';
  }

  get canSaveLabel() {
    return this.label && this.label.trim().length >= 2;
  }
}
