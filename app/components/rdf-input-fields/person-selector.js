import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';

import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';

import { triplesForPath } from '@lblod/submission-form-helpers';
import { NamedNode } from 'rdflib';
import { restartableTask } from 'ember-concurrency';

import { replaceSingleFormValue } from 'frontend-lmb/utils/replaceSingleFormValue';
import { ORG } from 'frontend-lmb/rdf/namespaces';
import { queryRecord } from 'frontend-lmb/utils/query-record';
import { showWarningToast } from 'frontend-lmb/utils/toasts';
import { loadBestuursorgaanUrisFromContext } from 'frontend-lmb/utils/form-context/application-context-meta-ttl';

export default class PersonSelectorComponent extends InputFieldComponent {
  inputId = 'input-' + guidFor(this);

  @service store;
  @service toaster;
  @service('verkiezing') verkiezingService;
  @service multiUriFetcher;

  @tracked person = null;

  @tracked initialized = false;
  @tracked isMandaatInForm = false;
  @tracked onlyElected = true;
  @tracked mandaatModel = null;
  @tracked bestuursorgaanIT = null;

  constructor() {
    super(...arguments);
    this.load();
    this.storeOptions.store.registerObserver(async () => {
      this.findMandaatInForm.perform();
    });
  }

  get title() {
    return this.args.field?.label || 'Persoon';
  }

  async load() {
    await Promise.all([this.loadProvidedValue(), this.loadBestuursorganen()]);
    this.findMandaatInForm.perform();
    this.initialized = true;
  }

  async loadProvidedValue() {
    const personTriples = triplesForPath(this.storeOptions, false).values;
    if (!personTriples.length) {
      return;
    }
    const personUri = personTriples[0].value;

    const matches = await this.store.query('persoon', {
      'filter[:uri:]': personUri,
    });
    this.person = matches.at(0);
  }

  async loadBestuursorganen() {
    const bestuursorgaanUris = loadBestuursorgaanUrisFromContext(
      this.storeOptions
    );

    if (!bestuursorgaanUris) {
      return;
    }

    this.bestuursorgaanIT = await this.multiUriFetcher.fetchUri(
      'bestuursorgaan',
      bestuursorgaanUris.at(0)
    );
  }

  @action
  async onUpdate(person) {
    const uri = person?.uri;

    if (uri) {
      replaceSingleFormValue(this.storeOptions, new NamedNode(uri));
    } else {
      replaceSingleFormValue(this.storeOptions, null);
    }

    this.hasBeenFocused = true;
    super.updateValidations();
    this.person = person;
    if (this.person && this.onlyElected) {
      const isElected = await this.verkiezingService.checkIfPersonIsElected(
        this.person.id,
        this.bestuursorgaanIT
      );
      if (!isElected) {
        this.person = null;
        replaceSingleFormValue(this.storeOptions, null);
        showWarningToast(
          this.toaster,
          'Selecteer een persoon die verkozen is in deze bestuursperiode.'
        );
      }
    }
  }

  findMandaatInForm = restartableTask(async () => {
    const mandaatNode = this.storeOptions.store.any(
      this.storeOptions.sourceNode,
      ORG('holds'),
      undefined,
      this.storeOptions.sourceGraph
    );
    if (!mandaatNode) {
      this.isMandaatInForm = false;
      return;
    }
    this.isMandaatInForm = true;
    const mandaatModel = await queryRecord(this.store, 'mandaat', {
      'filter[:uri:]': mandaatNode.value,
    });
    this.mandaatModel = mandaatModel;

    if (mandaatModel.isBurgemeester) {
      this.onlyElected = false;
      return;
    }

    this.onlyElected = !(await mandaatModel.allowsNonElectedPersons);
  });
}
