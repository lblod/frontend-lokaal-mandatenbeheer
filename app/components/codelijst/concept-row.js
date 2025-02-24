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
  async applyChanges() {
    if (!this.canSaveLabel) {
      return;
    }

    this.isEditing = false;
    if (this.args.concept.label === this.label?.trim()) {
      return;
    }

    this.args.concept.label = this.label?.trim();
    this.args.onConceptChanged(this.args.concept);
  }

  @action
  async discardChanges() {
    this.isEditing = false;
    this.label = this.args.concept.label?.trim() ?? 'Optie';
  }

  @action
  async delete() {
    if (!this.args.concept.id) {
      this.args.concept.destroyRecord();
      await this.args.concept.save();
    } else {
      this.args.concept.deleteRecord();
    }
    this.args.onConceptChanged(this.args.concept);
  }

  get canSaveLabel() {
    return this.label && this.label.trim().length >= 2;
  }
}
