import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { provide } from 'ember-provide-consume-context';
import { trackedFunction } from 'reactiveweb/function';
import { use } from 'ember-resources';

import { API } from 'frontend-lmb/utils/constants';
import { showErrorToast } from 'frontend-lmb/utils/toasts';

export default class EditableFormComponent extends Component {
  @use(getFieldsForForm) getFieldsForForm;

  @tracked currentForm;
  @tracked loading = true;
  @service formReplacements;
  @service semanticFormRepository;
  @service features;

  @tracked showEditModal;
  @tracked clickedField;

  constructor() {
    super(...arguments);
    this.updateForm();
    if (this.args.selectedField) {
      this.clickedField = this.args.selectedField;
    }
  }

  async updateForm() {
    this.loading = true;
    const currentFormId = this.formReplacements.getReplacement(
      this.args.form.id
    );
    const form = await this.semanticFormRepository.getFormDefinition(
      currentFormId,
      true
    );
    this.currentForm = form;
    this.loading = false;
    this.showEditModal = false;
  }

  get fields() {
    return this.getFieldsForForm?.value || [];
  }

  @action
  async setClickedField(fieldModel) {
    this.clickedField = fieldModel;
    if (this.args.onFieldSelected && fieldModel) {
      await this.getFieldsForForm.retry();
      const field = this.fields.filter(
        (f) => f.uri === fieldModel.uri?.value
      )[0];
      this.clickedField = field;
    }
    this.args.onFieldSelected(this.clickedField);
  }

  get editableFormsEnabled() {
    return this.features.isEnabled('editable-forms');
  }

  @provide('form-state')
  get formState() {
    const canEditFieldsInlineInForm =
      this.args.editFieldsInForm == undefined
        ? true
        : !!this.args.editFieldsInForm;
    return {
      editFieldsInForm: canEditFieldsInlineInForm,
      canSelectField: !!this.args.canSelectField,
      clickedField: this.clickedField,
      isReadOnly: this.args.isReadOnly,
      isFieldEditPencilShown:
        canEditFieldsInlineInForm && !this.args.toReceiveUserInput,
      isAddFieldShownInForm:
        !this.args.toReceiveUserInput && !this.args.isReadOnly,
      canMoveFieldsInForm:
        !this.args.toReceiveUserInput && !this.args.isReadOnly,
    };
  }

  @provide('form-context')
  get formContext() {
    return {
      onFormUpdate: () => this.updateForm(),
      onFieldClicked: (fieldModel) => this.setClickedField(fieldModel),
      formDefinition: this.currentForm,
    };
  }
}

function getFieldsForForm() {
  return trackedFunction(async () => {
    if (this.args.onFieldsInForm || !this.currentForm) {
      return [];
    }

    const response = await fetch(
      `${API.FORM_CONTENT_SERVICE}/custom-form/${this.currentForm.id}/fields`
    );

    if (!response.ok) {
      showErrorToast(
        this.toaster,
        `Er liep iets mis bij het ophalen van de velden voor formulier met id: ${this.currentForm?.id}`,
        'Formulier'
      );
    }

    const result = await response.json();
    return result.fields;
  });
}
