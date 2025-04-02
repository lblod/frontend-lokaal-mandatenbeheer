import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CodelijstInstanceTable extends Component {
  @service store;

  @tracked isCodelistNameValid;
  @tracked isConceptenChanged;

  get sortedConcepten() {
    return [...this.args.concepten].sort((a, b) => a.order - b.order);
  }

  get hasConceptsToDelete() {
    return this.args.concepten.filter((c) => c.isDeleted);
  }

  @action
  addConcept() {
    const concept = this.store.createRecord('concept', {
      label: 'Optie',
      order: this.args.concepten.length,
      conceptSchemes: [this.args.codelijst],
    });
    this.args.concepten.push(concept);
    this.args.onConceptChanged(concept);
  }

  @action
  updateCodelistName(value) {
    const { name, isValid } = value;
    this.args.codelijst.label = name;
    this.isCodelistNameValid = isValid;
    if (this.args.onCodelistNameUpdated) {
      this.args.onCodelistNameUpdated(value);
    }
  }

  @action
  onConceptChanged() {
    const nonRemovedConcepts = this.sortedConcepten.filter(
      (c) => !c.isDeleted || c.isDestroyed
    );
    for (let index = 0; index < nonRemovedConcepts.length; index++) {
      const indexOfConcept = this.args.concepten.indexOf(
        nonRemovedConcepts[index]
      );
      this.args.concepten[indexOfConcept].order = index;
    }
    this.args.onConceptChanged();
  }

  @action
  moveConcept(concept, upDown) {
    const factor = upDown === 'up' ? -1 : 1;
    const conceptOrder = concept.order;
    let orderWithFactor = conceptOrder + factor;

    if (orderWithFactor === -1) {
      orderWithFactor = this.args.concepten.length - 1;
    } else if (orderWithFactor === this.args.concepten.length) {
      orderWithFactor = 0;
    }
    let switchConcept = this.args.concepten.find(
      (l) => l.order === orderWithFactor
    );
    concept.order = switchConcept.order;
    switchConcept.order = conceptOrder;
    this.args.onConceptChanged(concept);
  }
}
