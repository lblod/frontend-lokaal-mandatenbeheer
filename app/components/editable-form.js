import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { provide } from 'ember-provide-consume-context';
import { trackedFunction } from 'reactiveweb/function';
import { use } from 'ember-resources';
import { ForkingStore } from '@lblod/ember-submission-form-fields';

import { API } from 'frontend-lmb/utils/constants';
import { showErrorToast } from 'frontend-lmb/utils/toasts';
import { SOURCE_GRAPH } from 'frontend-lmb/utils/constants';
import { isCustomForm } from 'frontend-lmb/utils/form-properties';
import { isCustomDisplayType } from 'frontend-lmb/models/display-type';

export default class EditableFormComponent extends Component {
  @use(getFieldsForForm) getFieldsForForm;

  @tracked currentForm;
  @tracked loading = true;
  @service formReplacements;
  @service semanticFormRepository;
  @service features;

  @tracked showEditModal;

  constructor() {
    super(...arguments);
    this.updateForm();
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

  get hasFormFields() {
    return this.fields.length >= 1;
  }

  get clickedField() {
    return this.args.selectedField;
  }

  @action
  async setClickedField(fieldModel) {
    let field = fieldModel;
    if (isCustomDisplayType(fieldModel?.displayType)) {
      await this.getFieldsForForm.retry();
      field = this.fields.filter((f) => f.uri === fieldModel.uri?.value)[0];
    }
    this.args.onFieldSelected?.(field);
  }

  get editableFormsEnabled() {
    return this.features.isEnabled('editable-forms');
  }

  @provide('form-state')
  get formState() {
    return {
      isEditFormDefinitionForm: !!this.args.isEditFormDefinitionForm,
      canEditFormDefinition: !!this.args.canEditFormDefinition,
      canSelectField: !!this.args.canSelectField,
      clickedField: this.clickedField,
      isReadOnly: this.args.isReadOnly,
    };
  }

  @provide('form-context')
  get formContext() {
    return {
      onFormUpdate: () => this.updateForm(),
      onFieldClicked: (fieldModel) => this.setClickedField(fieldModel),
      formDefinition: this.currentForm,
      fieldsInForm: this.fields,
    };
  }
}

function getFieldsForForm() {
  return trackedFunction(async () => {
    try {
      if (this.args.onFieldsInForm || !this.currentForm) {
        return [];
      }

      const forkingStore = new ForkingStore();
      forkingStore.parse(this.currentForm.formTtl, SOURCE_GRAPH, 'text/turtle');
      if (!isCustomForm(forkingStore)) {
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

      if (this.args.onFieldsSet) {
        this.args.onFieldsSet(result.fields);
      }
      return result.fields;
    } catch (e) {
      return [];
    }
  });
}
