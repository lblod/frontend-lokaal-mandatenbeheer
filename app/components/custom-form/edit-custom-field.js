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

  @tracked selectedField;
  @tracked displayType;
  @tracked conceptScheme;

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

  @action
  updateSelectedField(field) {
    this.selectedField = field;
    this.displayType = this.displayTypes.filter(
      (t) => t.uri === field.displayType
    )?.[0];
    this.conceptScheme = this.conceptSchemes.filter(
      (cs) => cs.uri === field.conceptScheme
    )?.[0];
  }

  @action
  updateFieldName(event) {
    this.selectedField.label = event.target?.value;
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
    this.selectedField.isRequired = !this.selectedField.isRequired;
  }

  @action
  toggleShowInSummary() {
    this.selectedField.isShownInSummary = !this.selectedField.isShownInSummary;
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
