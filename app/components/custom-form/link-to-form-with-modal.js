import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';

import { A } from '@ember/array';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import {
  triplesForPath,
  updateSimpleFormValue,
} from '@lblod/submission-form-helpers';
import { NamedNode } from 'rdflib';
import { task } from 'ember-concurrency';

import { API, JSON_API_TYPE } from 'frontend-lmb/utils/constants';
import { EXT } from 'frontend-lmb/rdf/namespaces';

export default class CustomFormLinkToFormWithModal extends InputFieldComponent {
  @service store;
  @service semanticFormRepository;

  @tracked isModalOpen;

  @tracked instanceObjectsOfOptions = [];
  @tracked instances = A([]);
  @tracked selectedInstanceOptions = A([]);
  @tracked instanceDisplayLabels = [];
  @tracked pageToLoad = 0;
  @tracked lastPageOfInstances;
  @tracked isLoadingMoreOptions;
  @tracked areAllInstancesFetched;
  @tracked searchValue;
  @tracked instancesMetadata;

  constructor() {
    super(...arguments);
    this.isSettingInitialSelectedOptions.perform();
  }

  @action
  openModal() {
    this.isModalOpen = true;

    if (this.isFetchingInstances) {
      return;
    }

    this.pageToLoad = 0;
    this.getInstances.perform();
  }

  @action
  onCloseModal(onInteractedWithField) {
    this.isModalOpen = false;
    this.searchValue = null;
    this.pageToLoad = 0;
    onInteractedWithField?.();
  }

  @action
  async selectInstance(option) {
    const matches = triplesForPath(this.storeOptions, true).values;
    if (option.isSelected) {
      const toRemove = this.selectedInstanceOptions.find(
        (o) => o.instance.uri == option.instance.uri
      );
      this.selectedInstanceOptions.removeObject(toRemove);
    } else {
      this.selectedInstanceOptions.pushObject(option);
    }

    // Cleanup
    matches
      .filter(
        (m) =>
          !this.selectedInstanceOptions.find(
            (opt) => m.value == opt.instance.uri
          )
      )
      .forEach((m) => updateSimpleFormValue(this.storeOptions, undefined, m));

    // Insert
    this.selectedInstanceOptions
      .filter(
        (selected) => !matches.find((m) => selected.instance.uri == m.value)
      )
      .forEach((opt) =>
        updateSimpleFormValue(
          this.storeOptions,
          new NamedNode(opt.instance.uri)
        )
      );
    super.updateValidations();
  }

  @action
  filterResults(event) {
    this.searchValue = event.target?.value;
    this.pageToLoad = 0;
    this.getInstances.perform();
  }

  get hasSelectedOptions() {
    return this.selectedInstanceOptions?.length >= 1;
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
    const instances = this.instancesToOptions(this.instances);

    instances.meta = this.instancesMetadata;
    return instances;
  }

  instancesToOptions(_instances) {
    const keysOfLabels = this.instanceDisplayLabels.map((label) => label.name);
    const uniqueInstanceIds = [];
    const instances = [];
    for (const instance of _instances) {
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
        isSelected: !!this.selectedInstanceOptions.find(
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
      filter:
        this.searchValue && this.searchValue.trim() !== ''
          ? this.searchValue
          : null,
    };
  }

  @action
  fetchPreviousPage({ previousPage }) {
    this.pageToLoad = previousPage;
    this.getInstances.perform();
  }

  @action
  fetchNextPage({ nextPage }) {
    this.pageToLoad = nextPage;
    this.getInstances.perform();
  }

  getInstances = task({ enqueue: true }, async () => {
    if (!this.formTypeUri || isNaN(this.pageToLoad)) {
      return;
    }
    const formInfo = await this.fetchInstancesForUris([]);
    this.instanceDisplayLabels = formInfo.labels;
    this.instances.clear();
    this.instances.pushObjects(formInfo.instances);
  });

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

      this.selectedInstanceOptions.pushObjects(
        this.instancesToOptions(formInfo.instances)
      );
    }
  });

  async fetchInstancesForUris(instanceUris, setPagination = true) {
    const queryParamsMap = {
      page: `page[number]=${this.filterInstancesParams.page}`,
      size: `page[size]=${this.filterInstancesParams.size}`,
      filter: `filter=${this.filterInstancesParams.filter}`,
    };
    const queryParams = Object.keys(this.filterInstancesParams)
      .filter((key) => this.filterInstancesParams[key])
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

    this.instancesMetadata = instances.meta;

    return instances;
  }
}
