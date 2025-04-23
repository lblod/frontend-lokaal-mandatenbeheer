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
import { task } from 'ember-concurrency';

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
  @tracked instances = A([]);
  @tracked selectedInstances = A([]);
  @tracked instanceDisplayLabels = [];
  @tracked pageToLoad;
  @tracked lastPageOfInstances;
  @tracked searchFilter;
  @tracked isLoadingMoreOptions;
  @tracked areAllInstancesFetched;

  LOAD_MORE_ID = 'load-more-instances';

  constructor() {
    super(...arguments);
    this.getInstances.perform();
  }

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

  get initialSelectedInstances() {
    return this.getInitialSelectedInstances?.value || [];
  }

  get isFetchingInstances() {
    return (
      isTrackedFunctionFetchingData(this.getInitialSelectedInstances) ||
      this.getInstances.isRunning
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
        searchString: Object.values(instance).join(';'),
      });
    }
    return instances;
  }

  async loadOptions() {
    const matches = triplesForPath(this.storeOptions);
    if (matches.values.length > 0) {
      this.extraInstanceUris.push(...matches.values.map((v) => v.value));
    }
  }

  @action
  async selectInstance(selectedInstances) {
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

  getInstances = task({ enqueue: true }, async (page = -1, lastPage = 1) => {
    if (!this.formTypeId || !lastPage || page >= lastPage) {
      return;
    }

    page++;

    const filterParams = {
      labels: this.labelsForFormType,
      page,
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
    this.instanceDisplayLabels = formInfo.labels;
    this.instances.pushObjects(formInfo.instances);

    this.getInstances.perform(
      page,
      formInfo.instances.meta.pagination.last?.number
    );
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
