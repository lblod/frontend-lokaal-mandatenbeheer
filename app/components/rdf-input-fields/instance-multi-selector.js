import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import {
  triplesForPath,
  updateSimpleFormValue,
} from '@lblod/submission-form-helpers';
import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import { restartableTask, timeout } from 'ember-concurrency';
import { NamedNode } from 'rdflib';
import { ACCEPT_HEADER, SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';
import { getFormProperty } from 'frontend-lmb/utils/form-properties';

const PAGESIZE = 10;

export default class RdfInstanceMultiSelectorComponent extends InputFieldComponent {
  inputId = 'select-' + guidFor(this);

  @tracked selected = null;
  @tracked options = [];
  @tracked searchEnabled = true;

  instanceLabelProperty;
  instanceApiUrl;

  constructor() {
    super(...arguments);
    this.load();
  }

  async load() {
    await this.loadOptions();
    await this.loadProvidedValue();
  }

  async loadOptions() {
    this.instanceLabelProperty = getFormProperty(
      this.args,
      'instanceLabelProperty'
    );
    this.instanceApiUrl = getFormProperty(this.args, 'instanceApiUrl');

    const response = await fetch(
      `${this.instanceApiUrl}?page[size]=${PAGESIZE}`,
      ACCEPT_HEADER
    );

    this.options = await this.parseResponse(response);
  }

  async loadProvidedValue() {
    if (this.isValid) {
      const matches = triplesForPath(this.storeOptions, true).values;
      let options = await Promise.all(
        matches.map(async (m) => {
          return await this.fetchSelectedOption(m.value);
        })
      );
      this.selected = options.filter((opt) => opt);
    }
  }

  @action
  updateSelectedItems(options) {
    this.selected = options;

    // Retrieve options in store
    const matches = triplesForPath(this.storeOptions, true).values;
    const matchingOptions = matches.filter((m) =>
      this.options.find((opt) => m.equals(opt.subject))
    );

    // Cleanup old value(s) in the store
    matchingOptions
      .filter((m) => !options.find((opt) => m.equals(opt.subject)))
      .forEach((m) => updateSimpleFormValue(this.storeOptions, undefined, m));

    // Insert new value in the store
    options
      .filter((opt) => !matchingOptions.find((m) => opt.subject.equals(m)))
      .forEach((option) =>
        updateSimpleFormValue(this.storeOptions, option.subject)
      );

    this.hasBeenFocused = true;
    super.updateValidations();
  }

  search = restartableTask(async (term) => {
    await timeout(SEARCH_TIMEOUT);

    const url = `${this.instanceApiUrl}?filter[${this.instanceLabelProperty}]=${term}&page[size]=${PAGESIZE}`;
    const response = await fetch(url, ACCEPT_HEADER);
    return await this.parseResponse(response);
  });

  async parseResponse(response) {
    if (!response.ok) {
      let error = new Error(response.statusText);
      error.status = response.status;
      throw error;
    }
    const result = await response.json();
    const options = result.data.map((m) => {
      const subject = new NamedNode(m.attributes['uri']);
      return {
        subject: subject,
        label: m.attributes[this.instanceLabelProperty],
      };
    });
    return options;
  }

  // TODO we want to do this with one call, something like the following unfortunately this doesn't work at this moment.
  // const url = `${instanceApiUrl}?filter[:uri:]=uri1,uri2`;
  // const url = `${instanceApiUrl}?filter[:or:][:uri:]=uri1&[:or:][:uri:]=uri2`;
  async fetchSelectedOption(term) {
    const url = `${this.instanceApiUrl}?filter[:uri:]=${encodeURIComponent(term)}`;
    const response = await fetch(url, ACCEPT_HEADER);
    const result = await this.parseResponse(
      response,
      this.instanceLabelProperty
    );
    return result[0];
  }
}
