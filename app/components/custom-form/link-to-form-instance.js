import Component from '@glimmer/component';

import { A } from '@ember/array';
import { action } from '@ember/object';
import { tracked, cached } from '@glimmer/tracking';

import { trackedFunction } from 'reactiveweb/function';
import { use } from 'ember-resources';

import { API } from 'frontend-lmb/utils/constants';
export default class CustomFormLinkToFormInstance extends Component {
  @tracked formType;
  @tracked form;
  @tracked formOptions = A([]);
  @tracked fields = A([]);
  @tracked selectedFormFields = A([]);

  @use(getFormTypes) getFormTypes;

  @action
  async selectFormType(type) {
    this.formType = type;
    this.form = null;
    this.fields.clear();
    this.formOptions.clear();
    this.formOptions.pushObjects(await this.fetchFormsForType());
  }

  @action
  selectFormOfType(form) {
    this.form = form;
  }

  @action
  updateSelectedFields(selected) {
    console.log({ selected });
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
        groupName: 'Standaar types',
        options: types.defaultTypes,
      },
    ];
  }

  @action
  async fetchFormsForType() {
    const response = await fetch(
      `${API.FORM_CONTENT_SERVICE}/custom-form/${this.formType.typeId}/form-options`
    );

    if (!response.ok) {
      console.error(
        `Er ging iets mis bij het ophalen van de formulieren van type ${this.formType.label}`
      );
      return [];
    }
    const result = await response.json();

    return result.forms;
  }

  get fieldOptions() {
    return [];
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
