import Component from '@glimmer/component';

import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';

import { CREATE_PERSON_FORM_ID } from 'frontend-lmb/utils/well-known-ids';

import { v4 as uuid } from 'uuid';

export default class PersonSelectorComponent extends Component {
  inputId = 'input-' + guidFor(this);

  @service store;
  @service persoonApi;
  @service semanticFormRepository;

  @tracked selectNewPerson = false;
  @tracked creatingPerson = false;
  @tracked createPersonFormDefinition;

  closeModal() {
    this.selectNewPerson = false;
    this.creatingPerson = false;
  }

  @action
  async onSelectPerson(person) {
    this.closeModal();
    this.args.onUpdate(person);
  }

  @action
  async onSelectNewPerson({ instanceId }) {
    const persoon = await this.store.findRecord('persoon', instanceId);
    this.closeModal();
    await this.persoonApi.putPersonInRightGraph(
      instanceId,
      this.args.bestuursorgaanIT.id
    );
    await this.args.onUpdate(persoon);
  }

  @action
  async onCreateNewPerson(input) {
    this.searchFormInput = input;
    this.createPersonFormDefinition =
      await this.semanticFormRepository.getFormDefinition(
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
    this.args.onUpdate(null);
  }

  @action
  buildSourceTtl(instanceUri) {
    const { voornaam, achternaam, rijksregisternummer } =
      this.searchFormInput ?? {};

    let identifierTriples = null;
    if (rijksregisternummer) {
      const id = uuid();
      identifierTriples = `
        <${instanceUri}> <http://www.w3.org/ns/adms#identifier> <http://data.lblod.info/id/identificatoren/${id}>.

        <http://data.lblod.info/id/identificatoren/${id}> a <http://www.w3.org/ns/adms#Identifier>.
        <http://data.lblod.info/id/identificatoren/${id}> <http://mu.semte.ch/vocabularies/core/uuid> "${id}".
        <http://data.lblod.info/id/identificatoren/${id}> <http://www.w3.org/2004/02/skos/core#notation> "${rijksregisternummer}".
      `;
    }

    return `
    <${instanceUri}> <http://mu.semte.ch/vocabularies/ext/possibleDuplicate> "true" .
    ${voornaam ? `<${instanceUri}> <http://data.vlaanderen.be/ns/persoon#gebruikteVoornaam> "${voornaam}".` : ''}
    ${achternaam ? `<${instanceUri}> <http://xmlns.com/foaf/0.1/familyName> "${achternaam}".` : ''}
    ${identifierTriples ? identifierTriples : ''}
    `;
  }

  get showTrashCan() {
    return this.args.showDelete ?? true;
  }
  get showEditAsIcon() {
    return this.args.showEditAsIcon ?? false;
  }

  get personModalTitle() {
    return this.creatingPerson ? 'Voeg persoon toe' : 'Selecteer een persoon';
  }
}
