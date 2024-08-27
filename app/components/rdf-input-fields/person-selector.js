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

export default class PersonSelectorComponent extends InputFieldComponent {
  inputId = 'input-' + guidFor(this);
  @tracked person = null;
  @service store;
  @service toaster;
  @service('verkiezing') verkiezingService;

  @tracked initialized = false;
  @tracked isMandaatInForm = false;
  @tracked searchElected = true;
  @tracked currentBestuursperiode = null;
  @tracked mandaatModel = null;

  constructor() {
    super(...arguments);
    this.load();
    this.storeOptions.store.registerObserver(async () => {
      await this.findMandaatInForm.perform();
    });
  }

  get title() {
    return this.args.field?.label || 'Persoon';
  }

  async load() {
    await this.loadProvidedValue();
    await this.findMandaatInForm.perform();
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
    if (this.person && this.searchElected) {
      const isElected = await this.verkiezingService.checkIfPersonIsElected(
        this.person.id,
        this.currentBestuursperiode
      );

      if (isElected.length === 0) {
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
      this.searchElected = false;
      return;
    }

    this.searchElected = !(await mandaatModel.isInBCSD());

    if (this.searchElected) {
      this.currentBestuursperiode = await (
        await mandaatModel.bevatIn
      )[0].heeftBestuursperiode;
    }
  });
}
