import Controller from '@ember/controller';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class CustomFormsInstancesDefinitionController extends Controller {
  @tracked isEditFormModalOpen;

  @action
  updateFormName(event) {
    this.model.form.name = event.target?.value?.trim();
  }

  get formNameErrorMessage() {
    if (!this.model.form.name) {
      return 'Naam is verplicht.';
    }
    return null;
  }

  @action
  updateFormDescription(event) {
    this.model.form.description = event.target?.value?.trim();
  }

  get isOverMaxCharacters() {
    return this.model.form.description?.length > 250;
  }

  get descriptionCharacters() {
    return `Karakters: ${this.model.form.description?.length || 0}/250`;
  }

  get saveButtonDisabled() {
    return this.isOverMaxCharacters || this.formNameErrorMessage;
  }

  @action
  async saveFormDetails() {
    await this.model.form.save();
    this.isEditFormModalOpen = false;
  }

  @action
  cancelUpdateFormDetails() {
    this.model.form.rollbackAttributes();
    this.isEditFormModalOpen = false;
  }
}
