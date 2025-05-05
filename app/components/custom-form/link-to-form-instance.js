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
  @tracked currentPagination;
  @tracked lastPageOfInstances;
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
    if (this.isFetchingInstances) {
      instances.push({ id: this.LOAD_MORE_ID, disabled: true });
    }

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
        disabled: this.selectedInstances.find(
          (o) => o.instance.id === instance.id
        ),
      });
    }

    return instances;
  }

  get filterInstancesParams() {
    return {
      page: this.pageToLoad,
      size: 20,
    };
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

  @action
  onOpenSelector() {
    if (this.isFetchingInstances || this.hasFetchedLastPage) {
      return;
    }

    this.getInstances.perform();
  }

  async fetchInstancesForUris(instanceUris, setPagination = true) {
    const queryParamsMap = {
      page: `page[number]=${this.filterInstancesParams.page}`,
      size: `page[size]=${this.filterInstancesParams.size}`,
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
    const formInfo = await response.json();
    if (!setPagination) {
      return {
        instances: formInfo.instances,
        labels: formInfo.labels,
      };
    }
    const enrichedInstances = this.addPaginationToInstances(
      formInfo.instances,
      response,
      this.filterInstancesParams
    );

    return {
      instances: enrichedInstances,
      labels: formInfo.labels,
    };
  }

  isSettingInitialSelectedOptions = task(async () => {
    const matches = triplesForPath(this.storeOptions, true);
    if (matches.values.length > 0) {
      const initialSelectedInstanceUris = matches.values.map((v) => v.value);
      const formInfo = await this.fetchInstancesForUris(
        initialSelectedInstanceUris,
        false
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
    if (!this.formTypeUri || isNaN(this.pageToLoad)) {
      return;
    }
    if (
      this.currentPagination &&
      this.currentPagination.self.number > this.currentPagination.last.number
    ) {
      return;
    }

    const formInfo = await this.fetchInstancesForUris([]);
    this.instanceDisplayLabels = formInfo.labels;
    this.instances.pushObjects(formInfo.instances);
    this.getInstances.perform();
  });

  addPaginationToInstances(_instances, response, options) {
    const instances = [];
    instances.push(..._instances);
    instances.meta = instances.meta || {};
    instances.meta.count = parseInt(response.headers.get('X-Total-Count'), 10);
    instances.meta.pagination = {
      first: {
        number: 0,
      },
      self: {
        number: options.page,
        size: options.size,
      },
      last: {
        number: Math.floor(instances.meta.count / options.size),
      },
    };
    if (options.page * options.size < instances.meta.count) {
      instances.meta.pagination.next = {
        number: options.page + 1,
        size: options.size,
      };
    }

    this.currentPagination = instances.meta.pagination;
    this.pageToLoad = this.currentPagination.next?.number;

    return instances;
  }
}
