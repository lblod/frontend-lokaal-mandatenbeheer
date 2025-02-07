import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CodelijstAddConceptModal extends Component {
  @service store;
  @tracked conceptName = null;

  get isConceptValid() {
    return this.conceptName?.length > 1;
  }

  @action
  updateConceptName(event) {
    this.conceptName = event?.target?.value;
  }

  @action
  addConcept() {
    const concept = this.store.createRecord('concept', {
      label: this.conceptName,
      conceptSchemes: this.args.conceptScheme ? [this.args.conceptScheme] : [],
    });
    this.args.onNewConcept(concept);
  }
}
