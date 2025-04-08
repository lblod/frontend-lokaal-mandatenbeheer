import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';

import { A } from '@ember/array';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { trackedFunction } from 'reactiveweb/function';
import { use } from 'ember-resources';

import { API } from 'frontend-lmb/utils/constants';
import { replaceSingleFormValue } from 'frontend-lmb/utils/replaceSingleFormValue';
export default class CustomFormLinkToFormInstance extends InputFieldComponent {
  @service semanticFormRepository;

  @tracked formType;
  @tracked form;
  @tracked formOptions = A([]);

  @use(getFormTypes) getFormTypes;

  @action
  async selectFormType(type) {
    this.formType = type;
    replaceSingleFormValue(this.storeOptions, null);
    const formInstances = await this.fetchFormsForType();
    this.formOptions.clear();
    this.formOptions.pushObjects(
      formInstances.map((instance) => {
        delete instance.uri;
        delete instance.id;
        return {
          values: Object.keys(instance).map((key) => {
            return { key, value: instance[key] };
          }),
        };
      })
    );
  }

  @action
  selectFormOfType(form) {
    this.form = form;
    replaceSingleFormValue(this.storeOptions, form.uri);

    super.updateValidations();
  }

  get formTypes() {
    const types = this.getFormTypes?.value;
    if (!types) {
      return [];
    }
    return [
      {
        groupName: 'Eigen types',
        options: types.customTypes,
      },
      {
        groupName: 'Standaard types',
        options: types.defaultTypes,
      },
    ];
  }

  @action
  async fetchFormsForType() {
    const allLabels = await this.semanticFormRepository.getHeaderLabels(
      this.formType.id
    );
    const summaryLabels = allLabels.filter((label) => label.isShownInSummary);
    const formInfo = await this.semanticFormRepository.fetchInstances(
      { id: this.formType.id },
      {
        labels: summaryLabels,
      }
    );
    return formInfo.instances;
  }
}

function getFormTypes() {
  return trackedFunction(async () => {
    const response = await fetch(
      `${API.FORM_CONTENT_SERVICE}/custom-form/form-type-options`
    );
    if (!response.ok) {
      console.error('Er ging iets mis bij het ophalen van de formulier types');
      return [];
    }
    return await response.json();
  });
}
