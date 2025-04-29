import SelectorComponent from '../rdf-input-fields/selector';

import { A } from '@ember/array';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import {
  triplesForPath,
  updateSimpleFormValue,
} from '@lblod/submission-form-helpers';
import { NamedNode } from 'rdflib';
import { consume } from 'ember-provide-consume-context';
import { task } from 'ember-concurrency';

import { API, JSON_API_TYPE } from 'frontend-lmb/utils/constants';
import { EXT } from 'frontend-lmb/rdf/namespaces';

export default class CustomFormLinkToFormInstance extends SelectorComponent {
  @service store;
  @service semanticFormRepository;

  @consume('form-context') formContext;

  @tracked instanceObjectsOfOptions = [];
  @tracked initialSelectedInstances = A([]);
  @tracked instances = A([]);
  @tracked selectedInstances = A([]);
  @tracked instanceDisplayLabels = [];
  @tracked pageToLoad = 0;
  @tracked lastPageOfInstances;
  @tracked searchFilter;
  @tracked isLoadingMoreOptions;
  @tracked areAllInstancesFetched;

  LOAD_MORE_ID = 'load-more-instances';

  constructor() {
    super(...arguments);
    this.isSettingInitialSelectedOptions.perform();
  }

  get formTypeUri() {
    return this.storeOptions.store.any(
      this.args.field.uri,
      EXT('linkedFormType'),
      undefined,
      this.storeOptions.formGraph
    )?.value;
  }

  get isFetchingInstances() {
    return (
      this.isSettingInitialSelectedOptions.isRunning ||
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
        searchString: [...Object.values(instance), instance.id].join(';'),
      });
    }

    if (this.isFetchingInstances) {
      instances.push({ id: this.LOAD_MORE_ID, disabled: true });
    }

    return instances;
  }

  get filterInstancesParams() {
    const params = {
      page: this.pageToLoad,
      size: 20,
      filter: this.searchFilter,
    };

    if (!this.searchFilter) {
      delete params.filter;
    }

    return params;
  }

  async loadOptions() {}

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
          new NamedNode(option.instance.uri)
        )
      );
    super.updateSelectedItems();
  }

  async fetchInstancesForUris(instanceUris) {
    const queryParamsMap = {
      page: `page[number]=${this.filterInstancesParams.page}`,
      size: `page[size]=${this.filterInstancesParams.size}`,
      filter: `filter=${this.filterInstancesParams.filter}`,
    };
    const queryParams = Object.keys(this.filterInstancesParams)
      .map((key) => queryParamsMap[key])
      .join('&');
    const response = await fetch(
      `${API.FORM_CONTENT_SERVICE}/instances/by-form-definition-uri?${queryParams}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': JSON_API_TYPE,
        },
        body: JSON.stringify({
          formDefinitionUri: this.formTypeUri,
          instanceUris,
        }),
      }
    );
    if (!response.ok) {
      console.error(
        `Er ging iets mis bij het ophalen van instances met uris ${instanceUris.split(', ')}`
      );
      return null;
    }

    return await response.json();
  }

  isSettingInitialSelectedOptions = task(async () => {
    const matches = triplesForPath(this.storeOptions, true);
    if (matches.values.length > 0) {
      const initialSelectedInstanceUris = matches.values.map((v) => v.value);
      const formInfo = await this.fetchInstancesForUris(
        initialSelectedInstanceUris
      );
      this.instanceDisplayLabels = formInfo.labels;

      if (formInfo.instances.length === 0) {
        return;
      }

      this.initialSelectedInstances.pushObjects(formInfo.instances);
      const selectedOptions = this.instancesAsOptions.filter((option) =>
        formInfo.instances
          .map((i) => i.id)
          .filter(
            (isInstance) => isInstance && isInstance !== this.LOAD_MORE_ID
          )
          .includes(option.instance?.id)
      );
      this.selectedInstances.pushObjects(selectedOptions);
    }
  });

  getInstances = task({ enqueue: true }, async () => {
    if (!this.formTypeUri) {
      return;
    }

    const formInfo = await this.fetchInstancesForUris([]);
    this.instanceDisplayLabels = formInfo.labels;
    this.instances.pushObjects(formInfo.instances);
    // this.getInstances.perform(
    //   page,
    //   formInfo.instances.meta.pagination.last?.number
    // );
  });
}
