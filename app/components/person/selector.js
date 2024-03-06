import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { CREATE_PERSON_FORM_ID } from 'frontend-lmb/utils/well-known-ids';
import Component from '@glimmer/component';

export default class PersonSelectorComponent extends Component {
  inputId = 'input-' + guidFor(this);

  @service store;

  @tracked person = null;
  @tracked selectNewPerson = false;
  @tracked creatingPerson = false;
  @tracked createPersonFormDefinition;

  constructor() {
    super(...arguments);
    this.person = this.args.person;
  }

  closeModal() {
    this.selectNewPerson = false;
    this.creatingPerson = false;
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
    this.person = null;
    this.args.onUpdate(this.person);
  }

  @action
  buildSourceTtl(instanceUri) {
    return `
    <${instanceUri}> <http://mu.semte.ch/vocabularies/ext/possibleDuplicate> "true" .
    `;
  }
}
