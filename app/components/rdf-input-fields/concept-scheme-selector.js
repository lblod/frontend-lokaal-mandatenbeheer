import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import {
  triplesForPath,
  updateSimpleFormValue,
} from '@lblod/submission-form-helpers';
import { NamedNode } from 'rdflib';
import { hasValidFieldOptions } from '@lblod/ember-submission-form-fields/utils/has-valid-field-options';
import { task, timeout } from 'ember-concurrency';
import { SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';

export default class RdfInputFieldsConceptSchemeSelectorComponent extends InputFieldComponent {
  inputId = 'select-' + guidFor(this);

  @service store;

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

  async loadProvidedValue() {
    if (this.isValid) {
      const matches = triplesForPath(this.storeOptions, true).values;
      if (!matches || matches.length == 0) {
        return;
      }
      this.selected = this.options.find((opt) =>
        matches.find((m) => m.equals(opt.subject))
      );
      if (!this.selected || this.selected.lenght == 0) {
        this.selected = await this.fetchSelectedOption(matches[0].value);
      }
    }
  }

  async parseData(data) {
    const options = data.map((m) => {
      const subject = new NamedNode(m.uri);
      return { subject: subject, label: m.label };
    });
    return options;
  }

  @action
  updateSelection(option) {
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

  search = task({ restartable: true }, async (term) => {
    await timeout(SEARCH_TIMEOUT);
    return await this.fetchOptions(term);
  });
}
