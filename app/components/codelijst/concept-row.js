import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CodelijstConceptRow extends Component {
  @service store;

  @tracked label;

  @tracked isEditing;
  @tracked errorMessage =
    'Label voor een concept moet minstens 2 karakters lang zijn.';

  constructor() {
    super(...arguments);
    if (this.args.concept) {
      this.label = this.args.concept.label;
    }
  }

  @action
  updateConceptLabel(event) {
    this.label = event.target?.value;
  }

  @action
  async saveChanges() {
    if (!this.canSaveLabel) {
      return;
    }

    this.errorMessage = null;
    this.isEditing = false;
    this.concept.label = this.label?.trim();
    await this.concept.save();
  }

  @action
  async discardChanges() {
    this.isEditing = false;
    this.label = this.args.concept.label ?? 'Optie';
  }

  get canSaveLabel() {
    return this.label && this.label.trim().length >= 2;
  }
}
