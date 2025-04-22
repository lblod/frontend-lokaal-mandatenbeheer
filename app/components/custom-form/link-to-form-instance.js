import SelectorComponent from '../rdf-input-fields/selector';

import { A } from '@ember/array';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { task, timeout } from 'ember-concurrency';
import {
  triplesForPath,
  updateSimpleFormValue,
} from '@lblod/submission-form-helpers';
import { NamedNode } from 'rdflib';
import { consume } from 'ember-provide-consume-context';

import {
  API,
  INPUT_DEBOUNCE,
  JSON_API_TYPE,
} from 'frontend-lmb/utils/constants';
import { EXT } from 'frontend-lmb/rdf/namespaces';
export default class CustomFormLinkToFormInstance extends SelectorComponent {
  @service store;
  @service semanticFormRepository;

  @consume('form-context') formContext;

  @tracked forms = A([]);
  @tracked formOptions = A([]);
  @tracked summaryLabels = [];
  @tracked pageToLoad = 0;
  @tracked searchFilter;
  @tracked isLoadingMoreOptions;
  @tracked canShowLoadMoreOptions = true;

  get formTypeId() {
    return this.storeOptions.store.any(
      this.args.field.uri,
      EXT('targetTypeId'),
      undefined,
      this.storeOptions.formGraph
    )?.value;
  }

  @action
  async selectFormsOfType(forms) {
    if (forms.filter((f) => f.id === 'load-more-options')?.length === 1) {
      this.isLoadingMoreOptions = true;
      await this.setFormOptions();
      this.isLoadingMoreOptions = false;
      return;
    }
    this.forms.clear();
    this.forms.pushObjects(forms);
    const matches = triplesForPath(this.storeOptions, true).values;
    matches
      .filter((m) => !forms.find((form) => m.value === form.uri))
      .forEach((m) => updateSimpleFormValue(this.storeOptions, undefined, m));
    forms
      .filter((form) => !matches.find((m) => form.uri === m.value))
      .forEach((option) =>
        updateSimpleFormValue(this.storeOptions, new NamedNode(option.uri))
      );
    super.updateSelectedItems();
  }

  async setFormOptions(instanceUris = null) {
    const formInstances = await this.fetchFormsForType(instanceUris);
    if (!this.isLoadingMoreOptions) {
      this.forms.clear();
    }
    if (formInstances.length === 0) {
      return;
    }
    if (this.formOptions.length > 0) {
      this.formOptions.popObject();
    }
    const addedOptionUris = this.formOptions.map((o) => o.instance?.uri);
    const uniqueFormOptionsToAdd = formInstances.map((instance) => {
      if (addedOptionUris.includes(instance.instance.uri)) {
        return;
      } else {
        addedOptionUris.push(instance.instance.uri);
      }
      return {
        id: instance.instance.id,
        uri: instance.instance.uri,
        values: Object.keys(instance.displayInstance).map((key) => {
          return { key, value: instance.displayInstance[key] };
        }),
      };
    });
    this.formOptions.pushObjects(uniqueFormOptionsToAdd);
    if (this.canShowLoadMoreOptions) {
      this.formOptions.pushObject({
        id: 'load-more-options',
      });
    }
  }

  @action
  preventCloseOnLoadMoreOptions() {
    if (this.isLoadingMoreOptions) {
      return false;
    }
  }

  searchForm = task({ restartable: true }, async (input) => {
    await timeout(INPUT_DEBOUNCE);
    if (this.searchFilter !== input?.trim()) {
      this.pageToLoad = 0;
      this.formOptions.clear();
    }
    this.searchFilter = input?.trim();
    await this.setFormOptions();
  });

  @action
  async fetchFormsForType(instanceUris = null) {
    const allLabels = await this.semanticFormRepository.getHeaderLabels(
      this.formTypeId
    );
    const summaryLabels = allLabels.filter((label) => label.isShownInSummary);
    const filterParams = {
      labels: summaryLabels,
      page: this.pageToLoad,
      size: 20,
      filter: this.searchFilter,
    };
    if (!this.searchFilter) {
      delete filterParams.filter;
    }

    const instances = [];
    const formInfo = await this.semanticFormRepository.fetchInstances(
      { id: this.formTypeId },
      filterParams
    );
    instances.push(...formInfo.instances);

    this.summaryLabels = formInfo.labels;
    const currentPage = formInfo.instances.meta.pagination.self.number;
    const lastPage = formInfo.instances.meta.pagination.last.number;
    this.pageToLoad =
      formInfo.instances.meta.pagination.next?.number ?? currentPage;
    this.canShowLoadMoreOptions = lastPage !== currentPage;
    if (instanceUris) {
      const formInfoForUris = await this.fetchInstancesForUris(instanceUris);
      instances.push(...formInfoForUris.instances);
    }

    const addedInstanceUris = [];
    return instances
      .map((instance) => {
        if (addedInstanceUris.includes(instance.uri)) {
          return;
        } else {
          addedInstanceUris.push(instance.uri);
        }

        let cleanedUpInstance = {};
        for (const label of formInfo.labels) {
          cleanedUpInstance[label.name] = instance[label.name];
        }
        return {
          displayInstance: cleanedUpInstance,
          instance,
        };
      })
      .filter((isInstance) => isInstance);
  }

  async loadOptions() {
    const matches = triplesForPath(this.storeOptions);
    console.log('matches', matches);
    if (matches.values.length > 0) {
      const selectedFormUris = matches.values.map((v) => v.value);
      console.log('formTypeId', this.formTypeId);
      if (this.formTypeId) {
        await this.setFormOptions(selectedFormUris);
        this.forms.pushObjects(
          this.formOptions.filter((form) => selectedFormUris.includes(form.uri))
        );
      }
    }
  }

  async fetchInstancesForUris(uris) {
    const response = await fetch(
      `${API.FORM_CONTENT_SERVICE}/${this.formTypeId}/get-instances-by-uri`,
      {
        method: 'POST',
        headers: {
          'Content-Type': JSON_API_TYPE,
        },
        body: JSON.stringify({
          labels: this.summaryLabels,
          uris,
        }),
      }
    );
    if (!response.ok) {
      console.error(
        `Er ging iets mis bij het ophalen van instances met uris ${uris.split(', ')}`
      );
      return null;
    }

    return await response.json();
  }
}
