import Controller from '@ember/controller';

import { A } from '@ember/array';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { showSuccessToast } from 'frontend-lmb/utils/toasts';

export default class CodelijstenNewController extends Controller {
  @service store;
  @service router;
  @service toaster;

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
    return this.conceptName?.length > 1;
  }

  @action
  openAddConceptModal() {
    this.conceptName = null;
    this.isModalOpen = true;
  }

  @action
  async saveCodelist() {
    this.isSaving = true;
    const codelijst = this.store.createRecord('concept-scheme', {
      label: this.name?.trim(),
      isReadOnly: false,
    });
    await codelijst.save();
    codelijst.concepts = await this.updateConceptsWithConceptScheme(codelijst);
    await codelijst.save();

    this.name = null;
    this.concepten.clear();
    this.isModalOpen = false;
    this.isSaving = false;
    showSuccessToast(
      this.toaster,
      'Codelijst succesvol aangemaakt',
      'Codelijst'
    );
    this.router.transitionTo('codelijsten.overzicht', {
      queryParams: { filter: codelijst.label },
    });
  }

  async updateConceptsWithConceptScheme(codelijst) {
    return Promise.all(
      this.concepten.map(async (_concept) => {
        _concept.conceptSchemes = [codelijst];

        await _concept.save();
        return _concept;
      })
    );
  }

  @action
  addConcept(unsavedConcept) {
    this.concepten.pushObject(unsavedConcept);
    this.isModalOpen = false;
  }

  @action
  deleteConcept(concept) {
    this.concepten.removeObject(concept);
  }
}
