import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';

import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { NamedNode, Literal } from 'rdflib';
import { hasValidFieldOptions } from '@lblod/ember-submission-form-fields/utils/has-valid-field-options';
import { task, timeout } from 'ember-concurrency';

import { SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';
import { FIELD_OPTION } from 'frontend-lmb/rdf/namespaces';
import { showWarningToast } from 'frontend-lmb/utils/toasts';
export default class ConceptSchemeSelectorComponent extends InputFieldComponent {
  inputId = 'select-' + guidFor(this);

  @service toaster;
  @service store;

  @tracked selected = null;
  @tracked searchEnabled = true;
  @tracked searchData = null;
  @tracked conceptScheme = null;
  @tracked options = [];

  constructor() {
    super(...arguments);

    this.load();
  }

  async load() {
    this.loadOptions();
    await this.loadProvidedValue();
    await this.fetchOptions();
  }

  loadOptions() {
    const fieldOptions = this.args.field.options;

    let { conceptScheme, isSearchEnabled } = this.getFieldOptionsByPredicates();
    if (!conceptScheme) {
      if (
        !hasValidFieldOptions(this.args.field, ['conceptScheme']) ||
        !fieldOptions.conceptScheme
      ) {
        showWarningToast(
          this.toaster,
          'No conceptScheme was added to field ',
          this.args.field.label
        );
        return;
      }
      this.conceptScheme = fieldOptions.conceptScheme;
    } else {
      this.conceptScheme = conceptScheme;
    }

    if (!isSearchEnabled) {
      if (fieldOptions.searchEnabled !== undefined) {
        this.searchEnabled = fieldOptions.searchEnabled;
      }
    } else {
      this.searchEnabled = Literal.toJS(isSearchEnabled);
    }
  }

  async fetchOptions() {
    if (!this.conceptScheme) {
      return [];
    }

    const queryParams = {
      filter: {
        'concept-schemes': {
          ':uri:': this.conceptScheme,
        },
      },
      sort: 'label',
      page: {
        size: 9999,
      },
    };
    if (this.searchData && this.searchData.trim().length > 0) {
      queryParams['filter']['label'] = this.searchData.trim();
    }
    const response = await this.store.query('concept', queryParams);

    this.options = response.map((m) => {
      const subject = new NamedNode(m.uri);
      return { subject: subject, label: m.label };
    });
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

  search = task({ restartable: true }, async (searchData) => {
    await timeout(SEARCH_TIMEOUT);
    this.searchData = searchData;
    await this.fetchOptions();
    return this.options;
  });

  getFieldOptionsByPredicates() {
    return {
      conceptScheme: this.args.formStore.any(
        this.args.field.uri,
        FIELD_OPTION('conceptScheme'),
        undefined,
        this.args.graphs.formGraph
      )?.value,
      isSearchEnabled: this.args.formStore.any(
        this.args.field.uri,
        FIELD_OPTION('searchEnabled'),
        undefined,
        this.args.graphs.formGraph
      )?.value,
    };
  }
}
