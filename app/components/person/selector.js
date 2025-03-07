import Component from '@glimmer/component';

import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';

import { CREATE_PERSON_FORM_ID } from 'frontend-lmb/utils/well-known-ids';

import { v4 as uuid } from 'uuid';
import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { JSON_API_TYPE, SOURCE_GRAPH } from 'frontend-lmb/utils/constants';
import { ADMS, FOAF, PERSOON, SKOS } from 'frontend-lmb/rdf/namespaces';
import { NamedNode } from 'rdflib';
import moment from 'moment';
export default class PersonSelectorComponent extends Component {
  inputId = 'input-' + guidFor(this);

  @service store;
  @service persoonApi;
  @service semanticFormRepository;

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
    await this.persoonApi.putPersonInRightGraph(
      instanceId,
      this.args.bestuursorgaanIT.id
    );
    await this.args.onUpdate(this.person);
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
    this.person = null;
    this.args.onUpdate(this.person);
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

  @action
  async checkPersonCreated(ttlCode, sourceNode) {
    // todo need to fetch the person info and send it, then clear the ttl except for type if it's a match or block if it exists with other info this isn't great.
    const forkingstore = new ForkingStore();
    forkingstore.parse(ttlCode, SOURCE_GRAPH, 'text/turtle');
    const sourceNodeUri = new NamedNode(sourceNode);
    const voornaam = forkingstore.any(
      sourceNodeUri,
      PERSOON('gebruikteVoornaam'),
      null,
      SOURCE_GRAPH
    );
    const achternaam = forkingstore.any(
      sourceNodeUri,
      FOAF('familyName'),
      null,
      SOURCE_GRAPH
    );
    const rrnUri = forkingstore.any(
      sourceNodeUri,
      ADMS('identifier'),
      null,
      SOURCE_GRAPH
    );
    const rrn = forkingstore.any(rrnUri, SKOS('notation'), null, SOURCE_GRAPH);
    const birthdateUri = forkingstore.any(
      sourceNodeUri,
      PERSOON('heeftGeboorte'),
      null,
      SOURCE_GRAPH
    );
    const birthDate = forkingstore.any(
      birthdateUri,
      PERSOON('datum'),
      null,
      SOURCE_GRAPH
    );
    const response = await fetch(`/person-api/person/copy-if-exists`, {
      method: 'POST',
      headers: {
        'Content-Type': JSON_API_TYPE,
      },
      body: JSON.stringify({
        firstName: voornaam.value,
        lastName: achternaam.value,
        identifier: rrn.value,
        birthDate: moment(birthDate.value).toDate(),
      }),
    });
    if (response.status > 299) {
      const body = await response.json();
      throw new Error(
        'Er liep iets fout bij het controleren van de persoon' +
          (body?.error?.title ? `: ${body.error.title}` : '')
      );
    }
    const body = await response.json();
    if (body.uri) {
      return `<${body.uri}> a <http://data.vlaanderen.be/ns/persoon#Persoon>.`;
    }
    if (body.safe) {
      return ttlCode;
    } else {
      throw new Error('Er bestaat al een persoon met dit rijksregisternummer');
    }
  }
}
