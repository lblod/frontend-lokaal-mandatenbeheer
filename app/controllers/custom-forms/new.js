import Controller from '@ember/controller';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CustomFormsNewController extends Controller {
  @service router;
  @service customForms;

  @tracked name;
  @tracked description;
  @tracked errorMessage;
  @tracked isSaving;
  @tracked isCreated;

  @tracked isUnsavedChangesModalOpen;
  @tracked savedTransition;

  @action
  onFormNameUpdate(event) {
    this.isCreated = false;
    this.name = event.target?.value;
    this.errorMessage = null;
    if (!this.isValidName) {
      this.errorMessage = 'Dit veld is verplicht';
    }
  }
  @action
  onFormDescriptionUpdate(event) {
    this.isCreated = false;
    this.description = event.target?.value;
  }

  get isValidName() {
    return this.name && this.name?.trim().length >= 1;
  }

  @action
  async saveForm() {
    this.isSaving = true;
    const id = await this.customForms.createEmptyDefinition(
      this.name.trim(),
      this.description
    );
    this.isSaving = false;
    this.isCreated = true;
    this.name = null;
    this.description = null;
    this.router.transitionTo('custom-forms.instances', id);
  }

  @action
  onCancel() {
    if (this.isValidName || this.description?.trim() !== '') {
      this.isUnsavedChangesModalOpen = true;
    } else {
      this.router.transitionTo('custom-forms.overview');
    }
  }

  @action
  discardChanges() {
    this.isUnsavedChangesModalOpen = false;
    this.name = null;
    this.description = null;
    if (this.savedTransition) {
      this.savedTransition?.retry();
    } else {
      this.router.transitionTo('custom-forms.overview');
    }
  }

  get descriptionCharacters() {
    return `Karakters: ${this.description?.length || 0}/500`;
  }

  get isOverMaxCharacters() {
    return this.description?.length > 500;
  }
}
