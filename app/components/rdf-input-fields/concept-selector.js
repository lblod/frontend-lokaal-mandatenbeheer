import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import { NamedNode } from 'rdflib';
import { hasValidFieldOptions } from '@lblod/ember-submission-form-fields/utils/has-valid-field-options';
import { task, timeout } from 'ember-concurrency';
import { SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';

export default class ConceptSchemeSelectorComponent extends InputFieldComponent {
  inputId = 'select-' + guidFor(this);

  @service store;

  @tracked selected = null;
  @tracked options = [];
  @tracked searchEnabled = true;
  conceptScheme = null;

  constructor() {
    super(...arguments);

    this.load();
  }

  async load() {
    await this.loadOptions();
    await this.loadProvidedValue();
  }

  async loadOptions() {
    const fieldOptions = this.args.field.options;

    if (!hasValidFieldOptions(this.args.field, ['conceptScheme'])) {
      return;
    }

    this.conceptScheme = fieldOptions.conceptScheme;

    if (fieldOptions.searchEnabled !== undefined) {
      this.searchEnabled = fieldOptions.searchEnabled;
    }

    this.options = await this.fetchOptions();
  }

  async loadProvidedValue() {}

  @action
  updateSelection() {
    this.hasBeenFocused = true;
    super.updateValidations();
  }

  async fetchSelectedOption(uri) {
    const response = await this.store.query('concept', {
      'filter[:uri:]': uri,
    });
    if (!response[0]) {
      return;
    }

    return {
      subject: new NamedNode(response[0].uri),
      label: response[0].label,
    };
  }

  async fetchOptions(searchData) {
    const queryParams = {
      filter: {
        label: searchData,
        'concept-schemes': {
          ':uri:': this.conceptScheme,
        },
      },
      sort: 'label',
    };
    if (searchData) {
      queryParams['filter']['label'] = searchData;
    }
    const response = await this.store.query('concept', queryParams);
    return await response.map((m) => {
      const subject = new NamedNode(m.uri);
      return { subject: subject, label: m.label };
    });
  }

  search = task({ restartable: true }, async (searchData) => {
    await timeout(SEARCH_TIMEOUT);
    let searchResults = await this.fetchOptions(searchData);
    this.options = searchResults;
    return searchResults;
  });
}
