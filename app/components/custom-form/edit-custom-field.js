import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked, cached } from '@glimmer/tracking';

import { trackedFunction } from 'reactiveweb/function';
import { use } from 'ember-resources';

import { API } from 'frontend-lmb/utils/constants';
import { showErrorToast } from 'frontend-lmb/utils/toasts';

export default class CustomFormEditCustomField extends Component {
  @use(getFieldsForForm) getFieldsForForm;
  @use(getDisplayTypes) getDisplayTypes;
  @use(getConceptSchemes) getConceptSchemes;

  @service store;
  @service customForms;

  @tracked selectedField;
  @tracked label;
  @tracked displayType;
  @tracked conceptScheme;
  @tracked isRequired;
  @tracked isShownInSummary;

  get fields() {
    return this.getFieldsForForm?.value || [];
  }

  @cached
  get displayTypes() {
    return this.getDisplayTypes?.value || [];
  }

  @cached
  get conceptSchemes() {
    return this.getConceptSchemes?.value || [];
  }

  get isChanged() {
    if (!this.selectedField) {
      return false;
    }

    return (
      this.selectedField.label !== this.label ||
      this.selectedField.displayType !== this.displayType?.uri ||
      this.selectedField.conceptScheme !== this.conceptScheme?.uri ||
      this.selectedField.isRequired !== this.isRequired ||
      this.selectedField.isShownInSummary !== this.isShownInSummary
    );
  }

  @action
  updateSelectedField(field) {
    this.selectedField = field;
    this.label = field?.label;
    this.isRequired = !!field?.isRequired;
    this.isShownInSummary = !!field?.isShownInSummary;
    this.displayType = this.displayTypes.filter(
      (t) => t.uri === field?.displayType
    )?.[0];
    this.conceptScheme = this.conceptSchemes.filter(
      (cs) => cs.uri === field?.conceptScheme
    )?.[0];
  }

  @action
  updateFieldName(event) {
    this.label = event.target?.value;
  }

  @action
  updateSelectedDisplayType(displayType) {
    this.displayType = displayType;
  }

  @action
  updateSelectedConceptScheme(conceptScheme) {
    this.conceptScheme = conceptScheme;
  }

  @action
  toggleIsRequired() {
    this.isRequired = !this.isRequired;
  }

  @action
  toggleShowInSummary() {
    this.isShownInSummary = !this.isShownInSummary;
  }

  @action
  async saveFieldChanges() {
    await this.customForms.updateCustomFormField(
      this.args.formDefinitionId,
      this.selectedField.uri,
      {
        label: this.label,
        displayTypeUri: this.displayType.uri,
        conceptSchemeUri: this.conceptScheme?.uri,
        isRequired: this.isRequired,
        isShownInSummary: this.isShownInSummary,
      }
    );

    if (this.args.onFieldUpdated) {
      this.selectedField = null;
      this.resetFieldValues();
      this.getFieldsForForm.retry();
      this.args.onFieldUpdated();
    }
  }

  @action
  resetFieldValues() {
    this.updateSelectedField(this.selectedField);
  }
}

function getFieldsForForm() {
  return trackedFunction(async () => {
    const response = await fetch(
      `${API.FORM_CONTENT_SERVICE}/custom-form/${this.args.formDefinitionId}/fields`
    );

    if (!response.ok) {
      showErrorToast(
        this.toaster,
        `Er liep iets mis bij het ophalen van de velden voor formulier met id: ${this.args.formDefinitionId}`,
        'Formulier'
      );
    }

    const result = await response.json();

    if (result.fields[0]) {
      this.updateSelectedField(result.fields[0]);
    }

    return result.fields;
  });
}

function getDisplayTypes() {
  return trackedFunction(async () => {
    return await this.store.query('display-type', {
      sort: 'label',
    });
  });
}

function getConceptSchemes() {
  return trackedFunction(async () => {
    return await this.store
      .query('concept-scheme', {
        page: { size: 9999 },
      })
      .then((entries) => {
        return [...entries].sort((a, b) =>
          a.displayLabel.localeCompare(b.displayLabel)
        );
      });
  });
}
