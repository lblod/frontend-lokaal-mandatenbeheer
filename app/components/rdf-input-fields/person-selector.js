import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import { triplesForPath } from '@lblod/submission-form-helpers';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { NamedNode } from 'rdflib';
import { replaceSingleFormValue } from 'frontend-lmb/utils/replaceSingleFormValue';
import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { CREATE_PERSON_FORM_ID } from 'frontend-lmb/utils/well-known-ids';

export default class PersonSelectorComponent extends InputFieldComponent {
  inputId = 'input-' + guidFor(this);

  @service store;

  @tracked person = null;
  @tracked initialized = false;
  @tracked selectNewPerson = false;
  @tracked creatingPerson = false;
  @tracked createPersonFormDefinition;

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

  closeModal() {
    this.selectNewPerson = false;
    this.creatingPerson = false;
  }

  @action
  async onSelectPerson(person) {
    const uri = person.uri;

    replaceSingleFormValue(this.storeOptions, new NamedNode(uri));
    this.hasBeenFocused = true;
    super.updateValidations();
    this.person = person;
    this.closeModal();
  }

  @action
  async onSelectNewPerson({ instanceId }) {
    const persoon = await this.store.findRecord('persoon', instanceId);
    replaceSingleFormValue(this.storeOptions, new NamedNode(persoon.uri));
    this.hasBeenFocused = true;
    super.updateValidations();
    this.person = persoon;
    this.closeModal();
  }

  @action
  async onCreateNewPerson() {
    this.createPersonFormDefinition = await getFormFrom(
      this.store,
      CREATE_PERSON_FORM_ID
    );
    this.creatingPerson = true;
  }

  @action
  startEdit() {
    this.selectNewPerson = true;
  }
  @action
  cancelEdit() {
    this.closeModal();
  }

  @action
  cancelCreate() {
    this.closeModal();
  }

  @action
  removePerson() {
    replaceSingleFormValue(this.storeOptions, null);
    this.hasBeenFocused = true;
    super.updateValidations();
    this.person = null;
    this.closeModal();
  }

  @action
  buildSourceTtl(instanceUri) {
    return `
    <${instanceUri}> <http://mu.semte.ch/vocabularies/ext/possibleDuplicate> "true" .
    `;
  }
}
