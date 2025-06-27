import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';

import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import {
  triplesForPath,
  updateSimpleFormValue,
} from '@lblod/submission-form-helpers';
import { task, timeout } from 'ember-concurrency';
import { MANDAAT, ORG } from 'frontend-lmb/rdf/namespaces';
import { SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';
import {
  MANDATARIS_TITELVOEREND_STATE,
  MANDATARIS_VERHINDERD_STATE,
} from 'frontend-lmb/utils/well-known-uris';
import { NamedNode } from 'rdflib';

export default class MandatarisReplacementSelector extends InputFieldComponent {
  inputId = 'input-' + guidFor(this);

  @service store;
  @service multiUriFetcher;

  @tracked replacement = null;
  @tracked initialized = false;
  @tracked mandaat = null;
  @tracked shouldRender = false;

  @tracked editing = false;

  constructor() {
    super(...arguments);
    this.load();
    this.registerObserver();
  }

  async load() {
    await Promise.all([
      this.loadProvidedValue(),
      this.loadMandaat(),
      this.loadPerson(),
    ]);
    this.initialized = true;
  }

  registerObserver() {
    const onFormUpdate = () => {
      if (this.isDestroyed) {
        return;
      }

      this.loadMandaat();
      this.refreshPersonFromForm();
      this.checkIfShouldRender();
    };
    this.storeOptions.store.registerObserver(onFormUpdate);
    onFormUpdate();
  }

  checkIfShouldRender() {
    this.shouldRender =
      this.storeOptions.store.any(
        this.storeOptions.sourceNode,
        MANDAAT('status'),
        new NamedNode(MANDATARIS_VERHINDERD_STATE),
        this.storeOptions.sourceGraph
      ) ||
      this.storeOptions.store.any(
        this.storeOptions.sourceNode,
        MANDAAT('status'),
        new NamedNode(MANDATARIS_TITELVOEREND_STATE),
        this.storeOptions.sourceGraph
      );
    if (!this.shouldRender && this.replacement) {
      // without timeout, the form ttl doesn't update immediately
      setTimeout(() => this.selectReplacement(null), 100);
    }
  }

  get title() {
    return this.args.field?.label || 'Tijdelijk vervangen door';
  }

  async loadMandaat() {
    const forkingStore = this.storeOptions.store;
    const mandaatUri = forkingStore.any(
      this.storeOptions.sourceNode,
      ORG('holds'),
      null,
      this.storeOptions.sourceGraph
    )?.value;

    if (!mandaatUri || this.mandaat?.uri === mandaatUri) {
      return;
    }

    this.mandaat = (
      await this.store.query('mandaat', {
        'filter[:uri:]': mandaatUri,
      })
    )[0];
  }

  async refreshPersonFromForm() {
    const forkingStore = this.storeOptions.store;
    const persoonUri = forkingStore.any(
      this.storeOptions.sourceNode,
      MANDAAT('isBestuurlijkeAliasVan'),
      null,
      this.storeOptions.sourceGraph
    )?.value;

    if (!persoonUri || this.mandatarisPerson?.uri === persoonUri) {
      return;
    }

    this.mandatarisPerson = (
      await this.store.query('persoon', {
        'filter[:uri:]': persoonUri,
      })
    )[0];
  }

  async loadPerson() {
    this.mandatarisPerson = (
      await this.store.query('persoon', {
        'filter[is-aangesteld-als][:uri:]': this.storeOptions.sourceNode.value,
      })
    )[0];
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
    this.replacement = matches?.[0];
  }

  search = task({ keepLatest: true }, async (searchData) => {
    await timeout(SEARCH_TIMEOUT);
    const result = await this.store.query('mandataris', {
      sort: 'is-bestuurlijke-alias-van.achternaam',
      include: 'is-bestuurlijke-alias-van',
      'filter[is-bestuurlijke-alias-van]': searchData,
      'filter[bekleedt][id]': this.mandaat.id,
    });
    return result.filter((mandataris) => {
      return (
        mandataris.get('isBestuurlijkeAliasVan.id') != this.mandatarisPerson.id
      );
    });
  });

  @action
  selectReplacement(mandataris) {
    if (this.isDestroyed || this.isDestroying) {
      return;
    }
    this.replacement = mandataris;

    // Retrieve options in store
    const matches = triplesForPath(this.storeOptions, true).values;

    // Cleanup old value(s) in the store
    matches
      .filter((m) => mandataris.uri !== m.value)
      .forEach((m) => updateSimpleFormValue(this.storeOptions, undefined, m));

    // Insert new value in the store
    updateSimpleFormValue(this.storeOptions, new NamedNode(mandataris.uri));

    this.hasBeenFocused = true;
    super.updateValidations();
  }
}
