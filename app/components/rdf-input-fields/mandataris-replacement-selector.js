import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import { triplesForPath } from '@lblod/submission-form-helpers';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { NamedNode } from 'rdflib';
import { replaceSingleFormValue } from 'frontend-lmb/utils/replaceSingleFormValue';
import { keepLatestTask, dropTask, timeout } from 'ember-concurrency';
import { SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';
import { EXT, ORG } from 'frontend-lmb/rdf/namespaces';

export default class MandatarisReplacementSelector extends InputFieldComponent {
  inputId = 'input-' + guidFor(this);

  @service store;

  @tracked replacement = null;
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
    const replacementUri = replacementTriples[0].value;

    const matches = await this.store.query('mandataris', {
      'filter[:uri:]': replacementUri,
    });
    this.replacement = matches.at(0);
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
  selectReplacement(mandataris) {
    this.replacement = mandataris;
    const uri = mandataris?.uri;
    if (uri) {
      replaceSingleFormValue(this.storeOptions, new NamedNode(uri));
    } else {
      replaceSingleFormValue(this.storeOptions, null);
    }

    this.hasBeenFocused = true;
    super.updateValidations();
  }
}
