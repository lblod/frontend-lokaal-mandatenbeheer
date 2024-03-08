import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import {
  triplesForPath,
  updateSimpleFormValue,
} from '@lblod/submission-form-helpers';
import { keepLatestTask, timeout } from 'ember-concurrency';
import { ORG } from 'frontend-lmb/rdf/namespaces';
import { SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';
import { NamedNode } from 'rdflib';

export default class MandatarisReplacementSelector extends InputFieldComponent {
  inputId = 'input-' + guidFor(this);

  @service store;
  @service multiUriFetcher;

  @tracked replacements = null;
  @tracked initialized = false;
  @tracked mandaat = [];

  @tracked editing = false;

  constructor() {
    super(...arguments);
    this.load();
  }

  async load() {
    await Promise.all([this.loadProvidedValue(), this.loadMandaat()]);
    this.initialized = true;
  }

  get title() {
    return this.args.field?.label || 'Tijdelijk vervangen door';
  }

  // todo need to watch store and refresh every time
  async loadMandaat() {
    const forkingStore = this.storeOptions.store;
    const mandaatUri = forkingStore.any(
      this.storeOptions.sourceNode,
      ORG('holds'),
      null,
      this.storeOptions.sourceGraph
    )?.value;

    if (!mandaatUri) {
      return;
    }

    this.mandaat = await this.store.query('mandaat', {
      'filter[:uri:]': mandaatUri,
    });
  }

  async loadProvidedValue() {
    const replacementTriples = triplesForPath(this.storeOptions, false).values;
    if (!replacementTriples.length) {
      return;
    }
    const replacementUris = replacementTriples.map((triple) => {
      return triple.value;
    });

    const matches = await this.multiUriFetcher.fetchUris(
      'mandataris',
      replacementUris
    );
    this.replacements = matches;
  }

  @keepLatestTask
  *search(searchData) {
    yield timeout(SEARCH_TIMEOUT);
    return this.store.query('mandataris', {
      sort: 'is-bestuurlijke-alias-van.achternaam',
      include: 'is-bestuurlijke-alias-van',
      filter: {
        'is-bestuurlijke-alias-van': {
          achternaam: searchData,
        },
        bekleedt: {
          id: this.mandaat.id,
        },
      },
    });
  }

  @action
  selectReplacement(mandatarises) {
    this.replacements = mandatarises;

    // Retrieve options in store
    const matches = triplesForPath(this.storeOptions, true).values;

    // Cleanup old value(s) in the store
    matches
      .filter((m) => !mandatarises.find((opt) => m.value == opt.uri))
      .forEach((m) => updateSimpleFormValue(this.storeOptions, undefined, m));

    // Insert new value in the store
    mandatarises.forEach((mandataris) =>
      updateSimpleFormValue(this.storeOptions, new NamedNode(mandataris.uri))
    );

    this.hasBeenFocused = true;
    super.updateValidations();
  }
}
