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
import { restartableTask, timeout } from 'ember-concurrency';
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

  loadProvidedValue() {
    if (this.isValid) {
      // Assumes valid input
      // This means even though we can have multiple values for one path (e.g. rdf:type)
      // this selector will only accept one value, and we take the first value from the matches.
      // The validation makes sure the matching value is the sole one.
      const matches = triplesForPath(this.storeOptions, true).values;
      this.selected = this.options.find((opt) =>
        matches.find((m) => m.equals(opt.subject))
      );
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

  search = restartableTask(async (term) => {
    await timeout(SEARCH_TIMEOUT);
    return await this.fetchOptions(term);
  });
}
