import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CodelijstConceptRow extends Component {
  @service store;

  @tracked concept;

  @tracked isEditing;

  constructor() {
    super(...arguments);
    if (this.args.concept) {
      this.concept = this.args.concept;
    }
  }

  @action
  updateConceptLabel(event) {
    this.concept.label = event.target?.value;
  }

  @action
  async saveChanges() {
    this.isEditing = false;
    await this.concept.save();
  }

  @action
  async discardChanges() {
    this.isEditing = false;
    this.args.concept.rollbackAttributes();
    this.concept = this.args.concept;
  }
}
