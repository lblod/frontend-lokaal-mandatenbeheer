import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';

import { A } from '@ember/array';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { task } from 'ember-concurrency';
import { triplesForPath } from '@lblod/submission-form-helpers';

import { API } from 'frontend-lmb/utils/constants';
import { replaceSingleFormValue } from 'frontend-lmb/utils/replaceSingleFormValue';

export default class CustomFormLinkToFormInstance extends InputFieldComponent {
  @service store;
  @service semanticFormRepository;

  @tracked formType;
  @tracked form;
  @tracked formOptions = A([]);
  @tracked formTypes = [];
  @tracked pageToLoad = 0;
  @tracked isLoadingMoreOptions;
  @tracked canShowLoadMoreOptions = true;

  constructor() {
    super(...arguments);
    this.setInitalValues.perform();
  }

  @action
  async selectFormType(type) {
    this.formType = type;
    replaceSingleFormValue(this.storeOptions, null);
    this.form = null;
    this.pageToLoad = 0;
    this.formOptions.clear();
    this.canShowLoadMoreOptions = true;
    await this.setFormOptions();
  }

  @action
  async selectFormOfType(form) {
    if (form.id === 'load-more-options') {
      this.isLoadingMoreOptions = true;
      await this.setFormOptions();
      this.isLoadingMoreOptions = false;
      return;
    }

    this.form = form;
    replaceSingleFormValue(this.storeOptions, form.uri);

    super.updateValidations();
  }

  async setFormOptions() {
    const formInstances = await this.fetchFormsForType();
    this.form = null;
    if (formInstances.length === 0) {
      return;
    }
    if (this.formOptions.length > 0) {
      this.formOptions.popObject();
    }

    this.formOptions.pushObjects(
      formInstances.map((instance) => {
        return {
          id: instance.instance.id,
          uri: instance.instance.uri,
          values: Object.keys(instance.displayInstance).map((key) => {
            return { key, value: instance.displayInstance[key] };
          }),
        };
      })
    );
    this.formOptions.pushObject({
      id: 'load-more-options',
      disabled: !this.canShowLoadMoreOptions,
    });
  }

  @action
  preventCloseOnLoadMoreOptions() {
    if (this.isLoadingMoreOptions) {
      return false;
    }
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
        page: this.pageToLoad,
        size: 20,
      }
    );
    const instances = formInfo.instances.map((instance) => {
      let cleanedUpInstance = {};
      for (const label of formInfo.labels) {
        cleanedUpInstance[label.name] = instance[label.name];
      }
      return {
        displayInstance: cleanedUpInstance,
        instance,
      };
    });
    const currentPage = formInfo.instances.meta.pagination.self.number;
    const lastPage = formInfo.instances.meta.pagination.last.number;
    this.pageToLoad = formInfo.instances.meta.pagination.next.number;
    this.canShowLoadMoreOptions = lastPage !== currentPage;
    return instances;
  }

  setInitalValues = task(async () => {
    const response = await fetch(
      `${API.FORM_CONTENT_SERVICE}/custom-form/form-type-options`
    );
    if (!response.ok) {
      console.error('Er ging iets mis bij het ophalen van de formulier types');
      return [];
    }
    const formTypes = await response.json();
    this.formTypes = [
      {
        groupName: 'Eigen types',
        options: formTypes.customTypes,
      },
      {
        groupName: 'Standaard types',
        options: formTypes.defaultTypes,
      },
    ];
    const matches = triplesForPath(this.storeOptions);
    if (matches.values.length > 0) {
      const selectedFormUri = matches.values[0].value;
      this.formType = [
        ...formTypes.customTypes,
        ...formTypes.defaultTypes,
      ].find(
        (type) =>
          type.usageUris?.includes(selectedFormUri) ||
          selectedFormUri.startsWith(type.prefix)
      );
      if (this.formType) {
        await this.setFormOptions();
        this.form = this.formOptions.find(
          (form) => form.uri === selectedFormUri
        );
      }
    }
  });
}
