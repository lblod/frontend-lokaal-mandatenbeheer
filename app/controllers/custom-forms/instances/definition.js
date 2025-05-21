import Controller from '@ember/controller';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import { consume } from 'ember-provide-consume-context';
import { timeout } from 'ember-concurrency';

export default class CustomFormsInstancesDefinitionController extends Controller {
  @consume('form-context') formContext;

  @tracked isEditFormModalOpen;
  @tracked isRefreshForm;
  @tracked selectedField;
  @tracked isShownInSummaryAddedToFields;

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
    return this.model.form.description?.length > 500;
  }

  get descriptionCharacters() {
    return `Karakters: ${this.model.form.description?.length || 0}/500`;
  }

  get saveButtonDisabled() {
    return this.isOverMaxCharacters || this.formNameErrorMessage;
  }

  @action
  setSelectedField(field) {
    this.selectedField = field;
  }

  @action
  async saveFormDetails() {
    await this.model.form.save();
    this.isEditFormModalOpen = false;
  }

  @action
  async updateFormContent(field) {
    this.isRefreshForm = true;
    await timeout(100);
    this.setSelectedField(field);
    this.isRefreshForm = false;
  }

  @action
  updateSelectedFieldData(fields) {
    if (this.selectedField) {
      this.selectedField = fields.filter(
        (f) => f.uri === this.selectedField.uri
      )[0];
    } else {
      this.selectedField = fields[0] || null;
    }
    this.isShownInSummaryAddedToFields = fields.every(
      (f) => !f.isShownInSummary
    );
  }

  @action
  cancelUpdateFormDetails() {
    this.model.form.rollbackAttributes();
    this.isEditFormModalOpen = false;
  }
}
