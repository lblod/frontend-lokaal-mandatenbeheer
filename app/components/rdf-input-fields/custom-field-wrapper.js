import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { task } from 'ember-concurrency';
import { consume } from 'ember-provide-consume-context';

import { JSON_API_TYPE } from 'frontend-lmb/utils/constants';
import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';

export default class RdfInputFieldsCustomFieldWrapperComponent extends Component {
  @consume('on-form-update') onFormUpdate;
  @consume('editable-form-id') editableFormId;

  @service toaster;
  @service formReplacements;
  @service semanticFormRepository;

  @tracked removing = false;
  @tracked showEditFieldModal;

  // Field properties
  @tracked name;
  @tracked type;
  @tracked order;

  get title() {
    return this.args.field?.label;
  }

  get canSaveChanges() {
    return this.fieldHasChanged && this.name && this.type && this.order;
  }

  get fieldHasChanged() {
    const { label, order, displayType } = this.args.field;

    return (
      this.name != label || this.type != displayType || this.order != order
    );
  }

  @action
  async loadCurrentFieldInfo() {
    const { label, order, displayType } = this.args.field;
    this.name = label;
    this.type = displayType;
    this.order = order;
  }

  @action
  async onRemove() {
    this.removing = true;
    await this.removeField();
    this.onFormUpdate();
    this.removed = false;
  }

  @action
  closeEditFieldModal() {
    this.showEditFieldModal = false;
  }

  @action
  updateField(event) {
    const { name, value } = event.target;
    this[name] = value;
  }

  saveChanges = task(async () => {
    await this.removeField();
    try {
      const result = await fetch(
        `/form-content/${this.editableFormId}/fields`,
        {
          method: 'POST',
          headers: {
            'Content-Type': JSON_API_TYPE,
          },
          body: JSON.stringify({
            displayType: this.type,
            order: this.order,
            name: this.name,
          }),
        }
      );

      const body = await result.json();
      const newFormId = body.id;
      this.formReplacements.setReplacement(this.editableFormId, newFormId);
      this.onFormUpdate();
    } catch (error) {
      showErrorToast(
        this.toaster,
        'Er ging iets mis bij het opslaan van het veld.'
      );
    }
    this.showEditFieldModal = false;
    showSuccessToast(this.toaster, 'Het veld werd succesvol aangepast.');
  });

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
}
