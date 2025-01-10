import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import { task } from 'ember-concurrency';

import { JSON_API_TYPE } from 'frontend-lmb/utils/constants';

export default class RdfInputFieldCrudCustomFieldModalComponent extends Component {
  @tracked isRemovingField;

  // Field properties
  @tracked fieldName;

  @action
  updateField(event) {
    const { name, value } = event.target;
    this[name] = value;
  }

  saveChanges = task(async () => {});

  async removeField() {
    await fetch(`/form-content/fields`, {
      method: 'DELETE',
      headers: {
        'Content-Type': JSON_API_TYPE,
      },
      body: JSON.stringify({
        fieldUri: this.args.field.uri.value,
        formUri: this.args.form.uri,
      }),
    });
  }

  @action
  async onRemove() {
    this.isRemovingField = true;
    await this.removeField();
    this.onFormUpdate();
    this.isRemovingField = false;
  }

  @action
  closeModal() {
    if (this.args.onCloseModal) {
      this.args.onCloseModal();
    }
  }

  get canSaveChanges() {
    return this.fieldHasChanged && this.fieldName;
  }

  get fieldHasChanged() {
    if (this.args.isCreating) {
      return true;
    }

    return this.fieldName !== this.args.field.label;
  }

  get title() {
    if (this.args.isCreating) {
      return 'Voeg een veld toe';
    }

    return 'Pas een veld aan';
  }

  get saveText() {
    if (this.args.isCreating) {
      return 'Bewaar';
    }

    return 'Pas aan';
  }
}
