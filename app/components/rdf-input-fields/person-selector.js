import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import { triplesForPath } from '@lblod/submission-form-helpers';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { NamedNode } from 'rdflib';
import { replaceSingleFormValue } from 'frontend-lmb/utils/replaceSingleFormValue';

export default class PersonSelectorComponent extends InputFieldComponent {
  inputId = 'input-' + guidFor(this);
  @tracked person = null;
  @service store;

  @tracked initialized = false;

  constructor() {
    super(...arguments);
    this.load();
  }

  get title() {
    return this.args.field?.label || 'Persoon';
  }

  async load() {
    await this.loadProvidedValue();
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
  }
}
