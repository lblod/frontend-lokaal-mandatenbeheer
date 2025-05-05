import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';

import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';

import { triplesForPath } from '@lblod/submission-form-helpers';
import { NamedNode } from 'rdflib';

import { replaceSingleFormValue } from 'frontend-lmb/utils/replaceSingleFormValue';

export default class UnrestrictedPersonSelectorComponent extends InputFieldComponent {
  inputId = 'input-' + guidFor(this);

  @service store;
  @service toaster;
  @service('verkiezing') verkiezingService;

  @tracked person = null;

  @tracked initialized = false;
  @tracked mandaatModel = null;

  constructor() {
    super(...arguments);
    this.load();
  }

  get title() {
    return this.args.field?.label || 'Persoon';
  }

  async load() {
    await this.loadProvidedValue();
  }

  async loadProvidedValue() {
    const personTriples = triplesForPath(this.storeOptions, false).values;
    if (!personTriples.length) {
      this.initialized = true;
      return;
    }
    const personUri = personTriples[0].value;

    const matches = await this.store.query('persoon', {
      'filter[:uri:]': personUri,
    });
    this.person = matches.at(0);
    this.initialized = true;
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
  }
}
