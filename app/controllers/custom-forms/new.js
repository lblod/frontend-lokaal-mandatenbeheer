import Controller from '@ember/controller';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CustomFormsNewController extends Controller {
  @service router;
  @service customForms;

  @tracked name;
  @tracked errorMessage;
  @tracked isSaving;

  @action
  onFormNameUpdate(event) {
    this.name = event.target?.value;
    this.errorMessage = null;
    if (!this.isValidName) {
      this.errorMessage = 'Dit veld is verplicht';
    }
  }

  get isValidName() {
    return this.name && this.name?.trim().length >= 1;
  }

  @action
  async saveForm() {
    this.isSaving = true;
    const id = await this.customForms.createEmptyDefinition(this.name.trim());
    this.isSaving = false;
    this.router.transitionTo('custom-forms.overview', id);
  }

  @action
  onCancel() {
    this.name = null;
    this.router.transitionTo('custom-forms.overview');
  }
}
