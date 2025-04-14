import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { trackedFunction } from 'reactiveweb/function';
import { use } from 'ember-resources';

import { API } from 'frontend-lmb/utils/constants';
import { showErrorToast } from 'frontend-lmb/utils/toasts';

export default class CustomFormEditCustomField extends Component {
  @use(getFieldsForForm) getFieldsForForm;
  @use(getDisplayTypes) getDisplayTypes;

  @service store;

  @tracked selectedField;

  get fields() {
    return this.getFieldsForForm?.value || [];
  }

  get displayTypes() {
    return this.getDisplayTypes?.value || [];
  }

  get selectedDisplayType() {
    if (!this.selectedField?.displayType) {
      return null;
    }

    return this.displayTypes.filter(
      (d) => d.uri === this.selectedField.displayType
    )?.[0];
  }

  @action
  updateSelectedField(field) {
    this.selectedField = field;
  }

  @action
  updateFieldName(event) {
    this.selectedField.label = event.target?.value;
  }

  @action
  updateSelectedDisplayType(displayType) {
    this.selectedField.displayType = displayType.uri;
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
