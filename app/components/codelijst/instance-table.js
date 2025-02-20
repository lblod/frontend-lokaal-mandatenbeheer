import Component from '@glimmer/component';

import { A } from '@ember/array';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CodelijstInstanceTable extends Component {
  @service store;

  @tracked concepten = A();

  constructor() {
    super(...arguments);
    if (this.args.concepten) {
      this.concepten.push(...this.args.concepten);
    }
  }

  get sortedConcepten() {
    return this.concepten.toArray().sortBy('order');
  }

  get isEditable() {
    return !this.args.isReadOnly;
  }

  @action
  addConcept() {
    const concept = this.store.createRecord('concept', {
      order: this.concepten.length,
    });
    this.concepten.pushObject(concept);
  }
}
