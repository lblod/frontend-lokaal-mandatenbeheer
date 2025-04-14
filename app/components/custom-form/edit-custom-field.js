import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import { trackedFunction } from 'reactiveweb/function';
import { use } from 'ember-resources';

import { API } from 'frontend-lmb/utils/constants';
import { showErrorToast } from 'frontend-lmb/utils/toasts';

export default class CustomFormEditCustomField extends Component {
  @use(getFieldsForForm) getFieldsForForm;

  @tracked selectedField;

  get fields() {
    return this.getFieldsForForm?.value || [];
  }

  @action
  updateSelectedField(field) {
    this.selectedField = field;
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
