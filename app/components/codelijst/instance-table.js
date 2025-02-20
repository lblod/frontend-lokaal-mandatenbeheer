import Component from '@glimmer/component';

import { A } from '@ember/array';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CodelijstInstanceTable extends Component {
  @service store;

  @tracked codelijst;
  @tracked concepten = A();

  @tracked isCodelistNameValid;
  @tracked isConceptenChanged;

  constructor() {
    super(...arguments);
    this.codelijst = this.args.codelijst;
    if (this.args.concepten) {
      this.concepten.push(...this.args.concepten);
    }
  }

  get sortedConcepten() {
    return this.concepten.toArray().sortBy('order');
  }

  @action
  addConcept() {
    const concept = this.store.createRecord('concept', {
      label: 'Optie',
      order: this.concepten.length,
      conceptSchemes: [this.codelijst],
    });
    this.concepten.pushObject(concept);
    this.args.onConceptChanged(concept);
  }

  @action
  updateCodelistName(value) {
    const { name, isValid } = value;
    this.codelijst.label = name;
    this.isCodelistNameValid = isValid;
    if (this.args.onCodelistNameUpdated) {
      this.args.onCodelistNameUpdated(value);
    }
  }

  get hasConceptsToDelete() {
    return this.concepten.filter((c) => c.isDeleted);
  }
}
