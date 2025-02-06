import Controller from '@ember/controller';

import { A } from '@ember/array';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CodelijstenNewController extends Controller {
  @service store;

  @tracked isModalOpen;
  @tracked isSaving;

  @tracked name;
  @tracked conceptName;
  @tracked concepten = A();

  @action
  updateName(event) {
    this.name = event?.target?.value;
  }

  @action
  updateConceptName(event) {
    this.conceptName = event?.target?.value;
  }

  get canSave() {
    return this.name?.length > 2 && this.concepten.length > 0;
  }

  get isConceptValid() {
    return this.conceptName?.length > 2;
  }

  @action
  openAddConceptModal() {
    this.conceptName = null;
    this.isModalOpen = true;
  }

  @action
  async saveCodelist() {
    console.log('save', {
      label: this.name ?? '',
      isReadOnly: false,
      concepts: this.concepten.toArray(),
    });
    return;
    this.isSaving = true;
    const codelijst = this.store.createRecord('concept-scheme', {
      label: this.name ?? '',
      isReadOnly: false,
      concepts: this.concepten.toArray(),
    });
    await codelijst.save();
    this.isSaving = false;
  }

  @action
  addConcept() {
    this.concepten.pushObject({
      label: this.conceptName,
    });
    this.isModalOpen = false;
  }

  @action
  deleteConcept(concept) {
    this.concepten.removeObject(concept);
  }
}
