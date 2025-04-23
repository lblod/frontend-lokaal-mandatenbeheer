import SelectorComponent from '../rdf-input-fields/selector';

import { A } from '@ember/array';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import {
  triplesForPath,
  updateSimpleFormValue,
} from '@lblod/submission-form-helpers';
import { Literal } from 'rdflib';
import { consume } from 'ember-provide-consume-context';

import { API, JSON_API_TYPE } from 'frontend-lmb/utils/constants';
import { EXT } from 'frontend-lmb/rdf/namespaces';
import { trackedFunction } from 'reactiveweb/function';
import { use } from 'ember-resources';
export default class CustomFormLinkToFormInstance extends SelectorComponent {
  @service store;
  @service semanticFormRepository;

  @use(getAllFormLabels) getAllFormLabels;
  @use(getInitialSelectedInstances) getInitialSelectedInstances;

  @consume('form-context') formContext;

  @tracked instanceObjectsOfOptions = [];
  @tracked extraInstanceUris = [];
  @tracked selectedInstances = A([]);
  @tracked instanceDisplayLabels = [];
  @tracked pageToLoad;
  @tracked lastPageOfInstances;
  @tracked searchFilter;
  @tracked isLoadingMoreOptions;
  @tracked areAllInstancesFetched;

  LOAD_MORE_ID = 'load-more-instances';

  get formTypeId() {
    return this.storeOptions.store.any(
      this.args.field.uri,
      EXT('targetTypeId'),
      undefined,
      this.storeOptions.formGraph
    )?.value;
  }

  get labelsForFormType() {
    return this.getAllFormLabels?.value || [];
  }

  get instances() {
    return this.getInstances?.value || [];
  }

  get initialSelectedInstances() {
    return this.getInitialSelectedInstances?.value || [];
  }

  get isFetchingInstances() {
    return (
      isTrackedFunctionFetchingData(this.getInitialSelectedInstances) ||
      isTrackedFunctionFetchingData(this.getInstances)
    );
  }

  get instancesAsOptions() {
    const keysOfLabels = this.instanceDisplayLabels.map((label) => label.name);
    const uniqueInstanceIds = [];
    const instances = [];
    for (const instance of [
      ...this.instances,
      ...this.initialSelectedInstances,
    ]) {
      if (uniqueInstanceIds.includes(instance.id)) {
        continue;
      } else {
        uniqueInstanceIds.push(instance.id);
      }
      instances.push({
        option: keysOfLabels.map((key) => {
          return {
            key: key,
            value: instance[key],
          };
        }),
        instance,
      });
    }

    if (!this.areAllInstancesFetched) {
      instances.push({
        id: this.LOAD_MORE_ID,
      });
    }

    return instances;
  }

  async loadOptions() {
    const matches = triplesForPath(this.storeOptions);
    if (matches.values.length > 0) {
      this.extraInstanceUris.push(...matches.values.map((v) => v.value));
    }
    this.pageToLoad = 0;
  }

  @action
  async selectInstance(selectedInstances) {
    if (
      selectedInstances.filter((f) => f.id === this.LOAD_MORE_ID)?.length === 1
    ) {
      if (this.pageToLoad !== this.lastPageOfInstances) {
        this.pageToLoad++;
        this.instanceObjectsOfOptions = this.instancesAsOptions
          .map((option) => option.instance)
          .filter((hasInstance) => hasInstance);
        this.getInstances.retry();
      }
      return;
    }

    this.selectedInstances.clear();
    this.selectedInstances.pushObjects(selectedInstances);
    const matches = triplesForPath(this.storeOptions, true).values;
    matches
      .filter(
        (m) =>
          !selectedInstances.find((option) => m.value === option.instance.uri)
      )
      .forEach((m) => updateSimpleFormValue(this.storeOptions, undefined, m));
    selectedInstances
      .filter((option) => !matches.find((m) => option.instance.uri === m.value))
      .forEach((option) =>
        updateSimpleFormValue(
          this.storeOptions,
          new Literal(option.instance.uri)
        )
      );
    super.updateSelectedItems();
  }

  @action
  preventCloseOnLoadMoreOptions() {
    if (this.isFetchingInstances) {
      return false;
    }
  }

  // searchForm = task({ restartable: true }, async (input) => {
  //   await timeout(INPUT_DEBOUNCE);
  //   if (this.searchFilter !== input?.trim()) {
  //     this.pageToLoad = 0;
  //     this.formOptions.clear();
  //   }
  //   this.searchFilter = input?.trim();
  //   await this.setFormOptions();
  // });

  async fetchInstancesForUris(uris) {
    const response = await fetch(
      `${API.FORM_CONTENT_SERVICE}/${this.formTypeId}/get-instances-by-uri`,
      {
        method: 'POST',
        headers: {
          'Content-Type': JSON_API_TYPE,
        },
        body: JSON.stringify({
          labels: this.labelsForFormType,
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

    const result = await response.json();
    return result.instances;
  }

  getInstances = trackedFunction(this, async () => {
    if (!this.formTypeId) {
      return [];
    }
    const filterParams = {
      labels: this.labelsForFormType,
      page: this.pageToLoad,
      size: 20,
      filter: this.searchFilter,
    };
    if (!this.searchFilter) {
      delete filterParams.filter;
    }
    const formInfo = await this.semanticFormRepository.fetchInstances(
      { id: this.formTypeId },
      filterParams
    );
    const pagination = formInfo.instances.meta.pagination;
    if (this.pageToLoad === pagination.last.number) {
      this.areAllInstancesFetched = true;
    }
    this.lastPageOfInstances = pagination.last?.number || this.pageToLoad;
    this.instanceDisplayLabels = formInfo.labels;

    return [...this.instanceObjectsOfOptions, ...formInfo.instances];
  });
}

function getAllFormLabels() {
  return trackedFunction(async () => {
    const allLabels = await this.semanticFormRepository.getHeaderLabels(
      this.formTypeId
    );
    return allLabels.filter((label) => label.isShownInSummary);
  });
}

function getInitialSelectedInstances() {
  return trackedFunction(async () => {
    if (!this.formTypeId || this.extraInstanceUris.length === 0) {
      return [];
    }
    return await this.fetchInstancesForUris(this.extraInstanceUris);
  });
}

function isTrackedFunctionFetchingData(trackedFunction) {
  if (!trackedFunction) {
    return false;
  }

  return trackedFunction.isLoading && !trackedFunction.isError;
}
