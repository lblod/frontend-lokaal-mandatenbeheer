import Component from '@glimmer/component';

import { A } from '@ember/array';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { trackedFunction } from 'reactiveweb/function';
import { use } from 'ember-resources';

import { API } from 'frontend-lmb/utils/constants';
export default class CustomFormLinkToFormInstance extends Component {
  @service semanticFormRepository;

  @tracked formType;
  @tracked form;
  @tracked formOptions = A([]);

  @use(getFormTypes) getFormTypes;

  @action
  async selectFormType(type) {
    this.formType = type;
    this.form = null;
    this.formOptions.clear();
    this.formOptions.pushObjects(await this.fetchFormsForType());
  }

  @action
  selectFormOfType(form) {
    this.form = form;
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
    const form = await this.semanticFormRepository.fetchInstances(
      { id: this.formType.id },
      {
        labels: summaryLabels,
      }
    );
    let label = summaryLabels[0]?.name || 'uri';

    return form.instances.map((instance) => instance[label] || instance.uri);
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
