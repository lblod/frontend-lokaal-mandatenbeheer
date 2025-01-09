import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { task } from 'ember-concurrency';

import { JSON_API_TYPE } from 'frontend-lmb/utils/constants';
import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';
import { MANDATARIS_EXTRA_INFO_FORM_ID } from 'frontend-lmb/utils/well-known-ids';

export default class RdfInputFieldsCustomFieldWrapperComponent extends Component {
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
    this.removed = true;
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
    try {
      const result = await fetch(
        `/form-content/${MANDATARIS_EXTRA_INFO_FORM_ID}/fields`,
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
      this.formReplacements.setReplacement(
        MANDATARIS_EXTRA_INFO_FORM_ID,
        newFormId
      );
    } catch (error) {
      showErrorToast(
        this.toaster,
        'Er ging iets mis bij het aanpassen van het veld.'
      );
    }
    this.showEditFieldModal = false;
    showSuccessToast(this.toaster, 'Het veld werd succesvol aangepast.');
  });
}
