import Component from '@glimmer/component';

import { A } from '@ember/array';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import { trackedFunction } from 'reactiveweb/function';
import { use } from 'ember-resources';

import { API } from 'frontend-lmb/utils/constants';
export default class CustomFormLinkToFormInstance extends Component {
  @tracked formType;
  @tracked form;
  @tracked fields = A([]);
  @tracked selectedFormFields = A([]);

  @use(getFormTypes) getFormTypes;

  @action
  selectFormType(type) {
    this.formType = type;
  }

  @action
  selectFormOfType(form) {
    console.log({ form });
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

  get forms() {
    return [];
  }

  get fieldOptions() {
    return [];
  }
}

function getFormTypes() {
  return trackedFunction(async () => {
    const response = await fetch(
      `${API.FORM_CONTENT_SERVICE}/custom-form/form-types`
    );

    if (!response.ok) {
      console.error('Er ging iets mis bij het ophalen van de formulier types');
      return [];
    }
    return await response.json();
  });
}
