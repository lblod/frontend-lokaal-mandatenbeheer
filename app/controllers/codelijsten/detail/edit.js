import Controller from '@ember/controller';

import { A } from '@ember/array';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CodelijstenDetailEditController extends Controller {
  @service router;

  @tracked name = this.model.codelijst?.label;
  @tracked concepten = A([...this.model.concepten]);

  @tracked conceptName;

  @tracked isModalOpen;

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

    if (this.concepten.some((concept) => concept.id === null)) {
      return true;
    }

    // deep check of concepten TODO:

    return false;
  }

  viewCodelist = () =>
    this.router.transitionTo(
      'codelijsten.detail.view',
      this.model.codelijst.id
    );

  @action
  updateName(event) {
    this.name = event.target.value;
  }

  @action
  async updateCodelist() {
    this.model.codelijst.label = this.name;
    this.concepten = await this.saveUnsavedConcepts();
    this.model.codelijst.concepts = this.concepten;
  }

  async saveUnsavedConcepts() {
    return await Promise.all(
      this.concepten.map(async (concept) => {
        if (concept.isNew) {
          await concept.save();
        }

        return concept;
      })
    );
  }

  @action
  deleteConcept(concept) {
    this.concepten.removeObject(concept);
  }

  @action
  addConcept(unsavedConcept) {
    this.concepten.pushObject(unsavedConcept);
    this.isModalOpen = false;
  }
}
