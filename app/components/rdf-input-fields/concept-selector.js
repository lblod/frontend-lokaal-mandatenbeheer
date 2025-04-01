import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';

import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { tracked, cached } from '@glimmer/tracking';
import { service } from '@ember/service';

import { NamedNode, Literal } from 'rdflib';
import { hasValidFieldOptions } from '@lblod/ember-submission-form-fields/utils/has-valid-field-options';
import { task, timeout } from 'ember-concurrency';
import { trackedFunction } from 'reactiveweb/function';
import { use } from 'ember-resources';

import { SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';
import { FIELD_OPTION } from 'frontend-lmb/rdf/namespaces';
import { showWarningToast } from 'frontend-lmb/utils/toasts';

function getOptions() {
  return trackedFunction(async () => {
    if (!this.conceptScheme) {
      return [];
    }

    const queryParams = {
      filter: {
        label: this.searchData,
        'concept-schemes': {
          ':uri:': this.conceptScheme,
        },
      },
      sort: 'label',
      page: {
        size: 9999,
      },
    };
    if (this.searchData) {
      queryParams['filter']['label'] = this.searchData;
    }
    const response = await this.store.query('concept', queryParams);

    return response.map((m) => {
      const subject = new NamedNode(m.uri);
      return { subject: subject, label: m.label };
    });
  });
}
export default class ConceptSchemeSelectorComponent extends InputFieldComponent {
  inputId = 'select-' + guidFor(this);

  @service toaster;
  @service store;

  @tracked selected = null;
  @tracked searchEnabled = true;
  @tracked searchData;
  @tracked conceptScheme = null;

  @use(getOptions) getOptions;

  constructor() {
    super(...arguments);

    this.load();
  }

  async load() {
    this.loadOptions();
    await this.loadProvidedValue();
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

  async loadProvidedValue() {}

  @cached
  get options() {
    return this.getOptions?.value || [];
  }

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
