import Controller from '@ember/controller';

import { A } from '@ember/array';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CodelijstenDetailEditController extends Controller {
  @service router;
  @service store;

  @tracked name;
  @tracked concepten = A();

  @tracked conceptName;

  @tracked isModalOpen;

  modelConceptListHash;

  get canSave() {
    return (
      (this.isNameChanged && this.name?.length > 2) ||
      (this.concepten.length > 0 && this.conceptListIsDiverging)
    );
  }

  get isNameChanged() {
    return this.model.codelijst.label !== this.name;
  }

  get conceptListIsDiverging() {
    if (this.concepten.length !== this.model.concepten.length) {
      return true;
    }

    return (
      this.modelConceptListHash !== this._createComparisonHash(this.concepten)
    );
  }

  get sortedConcepten() {
    return this.concepten.sortBy('order');
  }

  @action
  onCancel() {
    this.isModalOpen = false;
    this.router.transitionTo(
      'codelijsten.detail.view',
      this.model.codelijst.id
    );
  }

  @action
  updateName(event) {
    this.name = event.target.value;
  }

  @action
  async updateCodelist() {
    this.model.codelijst.label = this.name;
    this.concepten = await this.saveConcepts();
    this.model.codelijst.concepts = this.concepten;
    await this.model.codelijst.save();
    this.router.transitionTo(
      'codelijsten.detail.view',
      this.model.codelijst.id
    );
  }

  async saveConcepts() {
    // creates or deletes the records in the database
    return await Promise.all(
      this.concepten.map(async (concept) => {
        await concept.save();
        return concept;
      })
    );
  }

  @action
  deleteConcept(concept) {
    this.concepten.removeObject(concept);
    concept.deleteRecord();
  }

  @action
  addConcept(unsavedConcept) {
    this.concepten.pushObject(unsavedConcept);
    this.isModalOpen = false;
  }

  @action
  moveConcept(concept, upDown) {
    const factor = upDown === 'up' ? -1 : 1;
    const conceptOrder = concept.order;
    let orderWithFactor = conceptOrder + factor;

    if (orderWithFactor === -1) {
      orderWithFactor = this.concepten.length - 1;
    } else if (orderWithFactor === this.concepten.length) {
      orderWithFactor = 0;
    }
    let switchConcept = this.concepten.find((l) => l.order === orderWithFactor);
    concept.order = switchConcept.order;
    switchConcept.order = conceptOrder;
  }

  resetToModelValues(codelijst, concepten) {
    this.concepten.clear();
    this.concepten.pushObjects(concepten);
    this.modelConceptListHash = this._createComparisonHash(concepten);
    this.name = codelijst.label;
  }

  _createComparisonHash(conceptArray) {
    return JSON.stringify(
      conceptArray
        .toArray()
        .sortBy('order')
        .map((c) => c.label)
    );
  }
}
