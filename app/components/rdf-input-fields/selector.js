import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import { task, timeout } from 'ember-concurrency';
import { NamedNode } from 'rdflib';
import { ACCEPT_HEADER, SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';
import { getFormProperty } from 'frontend-lmb/utils/form-properties';

const PAGESIZE = 10;

export default class SelectorComponent extends InputFieldComponent {
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

  async loadProvidedValue() {}

  @action
  updateSelectedItems() {
    this.hasBeenFocused = true;
    super.updateValidations();
  }

  search = task({ restartable: true }, async (term) => {
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

  async fetchSelectedOption(term) {
    const url = `${this.instanceApiUrl}?filter[:uri:]=${encodeURIComponent(term)}`;
    const response = await fetch(url, ACCEPT_HEADER);
    return await this.parseResponse(response);
  }
}
