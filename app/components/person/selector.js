import Component from '@glimmer/component';

import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';

import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { CREATE_PERSON_FORM_ID } from 'frontend-lmb/utils/well-known-ids';

export default class PersonSelectorComponent extends Component {
  inputId = 'input-' + guidFor(this);

  @service store;

  @tracked person = null;
  @tracked selectNewPerson = false;
  @tracked creatingPerson = false;
  @tracked createPersonFormDefinition;

  closeModal() {
    this.selectNewPerson = false;
    this.creatingPerson = false;
  }

  constructor() {
    super(...arguments);
    this.onPersonChange();
  }

  @action
  onPersonChange() {
    this.person = this.args.person;
  }

  @action
  async onSelectPerson(person) {
    this.person = person;
    this.closeModal();
    this.args.onUpdate(this.person);
  }

  @action
  async onSelectNewPerson({ instanceId }) {
    const persoon = await this.store.findRecord('persoon', instanceId);
    this.person = persoon;
    this.closeModal();
    this.args.onUpdate(this.person);
  }

  @action
  async onCreateNewPerson(input) {
    this.searchFormInput = input;
    this.createPersonFormDefinition = await getFormFrom(
      this.store,
      CREATE_PERSON_FORM_ID
    );
    this.creatingPerson = true;
  }

  @action
  startEdit() {
    if (this.args.readOnly) {
      return;
    }

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
    this.person = null;
    this.args.onUpdate(this.person);
  }

  @action
  buildSourceTtl(instanceUri) {
    const { voornaam, achternaam, rijksregisternummer } =
      this.searchFormInput ?? {};

    return `
    <${instanceUri}> <http://mu.semte.ch/vocabularies/ext/possibleDuplicate> "true" .
    ${voornaam ? `<${instanceUri}> <http://data.vlaanderen.be/ns/persoon#gebruikteVoornaam> "${voornaam}".` : ''}
    ${achternaam ? `<${instanceUri}> <http://xmlns.com/foaf/0.1/familyName> "${achternaam}".` : ''}
    ${rijksregisternummer ? `<${instanceUri}> <http://www.w3.org/ns/adms#identifier> [ <http://www.w3.org/2004/02/skos/core#notation> "${rijksregisternummer}" ].` : ''}
    `;
  }

  get showTrashCan() {
    return this.args.showDelete ?? true;
  }
  get showEditAsIcon() {
    return this.args.showEditAsIcon ?? false;
  }
}
