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
  updateCodelist() {}

  // copied
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

  get isConceptValid() {
    return this.conceptName?.length > 1;
  }

  @action
  openAddConceptModal() {
    this.conceptName = null;
    this.isModalOpen = true;
  }

  @action
  updateConceptName(event) {
    this.conceptName = event?.target?.value;
  }
}
