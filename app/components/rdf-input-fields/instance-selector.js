import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import { tracked } from '@glimmer/tracking';
import {
  updateSimpleFormValue,
  triplesForPath,
} from '@lblod/submission-form-helpers';
import { NamedNode } from 'rdflib';
import { restartableTask, timeout } from 'ember-concurrency';
import { ACCEPT_HEADER, SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';
import { FORM } from 'frontend-lmb/rdf/namespaces';

const PAGESIZE = 10;

export default class RdfInstanceSelectorComponent extends InputFieldComponent {
  inputId = 'input-' + guidFor(this);

  @tracked selected = null;
  @tracked options = [];
  @tracked searchEnabled = true;

  constructor() {
    super(...arguments);
    this.load();
  }

  async load() {
    await this.loadOptions();
    await this.loadProvidedValue();
  }

  async loadOptions() {
    const instanceLabelProperty = this.getFormProperty('instanceLabelProperty');
    const instanceApiUrl = this.getFormProperty('instanceApiUrl');

    const response = await fetch(
      `${instanceApiUrl}?page[size]=${PAGESIZE}`,
      ACCEPT_HEADER
    );

    this.options = await this.parseResponse(response, instanceLabelProperty);
  }

  async loadProvidedValue() {
    if (this.isValid) {
      const matches = triplesForPath(this.storeOptions, true).values;
      const options = await this.fetchSelectedOption(matches[0].value);
      this.selected = options.find((opt) =>
        matches.find((m) => m.equals(opt.subject))
      );
    }
  }

  @action
  updateSelectedItems(option) {
    this.selected = option;

    // Cleanup old value(s) in the store
    const matches = triplesForPath(this.storeOptions, true).values;
    const matchingOptions = matches.filter((m) =>
      this.options.find((opt) => m.equals(opt.subject))
    );
    matchingOptions.forEach((m) =>
      updateSimpleFormValue(this.storeOptions, undefined, m)
    );

    // Insert new value in the store
    if (option) {
      updateSimpleFormValue(this.storeOptions, option.subject);
    }

    this.hasBeenFocused = true;
    super.updateValidations();
  }

  searchRepo = restartableTask(async (term) => {
    await timeout(SEARCH_TIMEOUT);
    const instanceLabelProperty = this.getFormProperty('instanceLabelProperty');
    const instanceApiUrl = this.getFormProperty('instanceApiUrl');

    const url = `${instanceApiUrl}?filter[${instanceLabelProperty}]=${term}&page[size]=${PAGESIZE}`;
    const response = await fetch(url, ACCEPT_HEADER);
    return await this.parseResponse(response, instanceLabelProperty);
  });

  getFormProperty(property) {
    const formGraph = this.args.graphs.formGraph;

    return this.args.formStore.match(
      this.args.field.uri,
      FORM(property),
      undefined,
      formGraph
    )[0].object.value;
  }

  async parseResponse(response, instanceLabelProperty) {
    if (!response.ok) {
      let error = new Error(response.statusText);
      error.status = response.status;
      throw error;
    }
    const result = await response.json();
    const options = result.data.map((m) => {
      const subject = new NamedNode(m.attributes['uri']);
      return { subject: subject, label: m.attributes[instanceLabelProperty] };
    });
    return options;
  }

  async fetchSelectedOption(term) {
    const instanceLabelProperty = this.getFormProperty('instanceLabelProperty');
    const instanceApiUrl = this.getFormProperty('instanceApiUrl');

    const url = `${instanceApiUrl}?filter[:uri:]=${encodeURIComponent(term)}`;
    const response = await fetch(url, ACCEPT_HEADER);
    return await this.parseResponse(response, instanceLabelProperty);
  }
}
