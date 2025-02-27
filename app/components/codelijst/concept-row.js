import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CodelijstConceptRow extends Component {
  @service store;
  @service toaster;
  @service conceptSchemeApi;

  @tracked isImplementationModalOpen;
  @tracked conceptImplementations;
  @tracked errorMessage =
    'Label voor een concept moet minstens 2 karakters lang zijn.';

  @action
  updateConceptLabel(event) {
    this.args.concept.label = event.target?.value;
    if (!this.canSaveLabel) {
      return;
    }
    this.args.concept.label = this.args.concept.label?.trim();
    this.args.onConceptChanged();
  }

  @action
  async delete() {
    if (!this.args.concept.id) {
      this.args.concept.destroyRecord();
      await this.args.concept.save();
      this.args.onConceptChanged();
      return;
    }
    this.conceptImplementations =
      await this.conceptSchemeApi.conceptHasImplementations(
        this.args.concept?.id
      );
    this.isImplementationModalOpen =
      this.conceptImplementations.hasImplementations;
    if (!this.isImplementationModalOpen) {
      this.args.concept.deleteRecord();
      this.args.onConceptChanged();
    }
  }

  @action
  confirmedDeleteOfUsedConcept() {
    this.args.concept.deleteRecord();
    this.args.onConceptChanged();
  }

  get canSaveLabel() {
    return (
      this.args.concept.label && this.args.concept.label?.trim().length >= 2
    );
  }
}
