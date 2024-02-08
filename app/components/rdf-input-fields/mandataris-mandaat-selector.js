import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import { triplesForPath } from '@lblod/submission-form-helpers';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { NamedNode } from 'rdflib';
import { replaceSingleFormValue } from 'frontend-lmb/utils/replaceSingleFormValue';
import { EXT } from 'frontend-lmb/rdf/namespaces';

export default class MandatarisMandaatSelector extends InputFieldComponent {
  inputId = 'input-' + guidFor(this);

  @service store;

  @tracked mandaat = null;
  @tracked initialized = false;
  @tracked bestuursorganen = [];

  constructor() {
    super(...arguments);
    this.load();
  }

  async load() {
    await this.loadProvidedValue();
    await this.loadBestuursorgaan();
    this.initialized = true;
  }

  async loadBestuursorgaan() {
    const forkingStore = this.storeOptions.store;
    const bestuursorgaanUri = forkingStore.any(
      EXT('applicationContext'),
      EXT('currentBestuursorgaan'),
      null,
      this.storeOptions.metaGraph
    );

    if (!bestuursorgaanUri) {
      return;
    }

    this.bestuursorganen = await this.store.query('bestuursorgaan', {
      'filter[:uri:]': bestuursorgaanUri.value,
    });
  }

  async loadProvidedValue() {
    const mandaatTriples = triplesForPath(this.storeOptions, false).values;
    if (!mandaatTriples.length) {
      return;
    }
    const mandaatUri = mandaatTriples[0].value;

    const matches = await this.store.query('mandaat', {
      'filter[:uri:]': mandaatUri,
    });
    this.mandaat = matches.at(0);
  }

  @action
  async updateMandaat(mandate) {
    const uri = mandate.uri;
    replaceSingleFormValue(this.storeOptions, new NamedNode(uri));
    this.hasBeenFocused = true;
    super.updateValidations();
  }
}
