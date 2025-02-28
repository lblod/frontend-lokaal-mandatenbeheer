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

  @action
  updateConceptLabel(event) {
    this.args.concept.label = event.target?.value;
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

  get minCharacters() {
    return this.args.minCharacters ?? 1;
  }

  get canSaveLabel() {
    return (
      this.args.concept.label &&
      this.args.concept.label?.trim().length >= this.minCharacters
    );
  }

  get infoMessage() {
    return `Label voor een concept moet minstens ${this.minCharacters} karakter${this.minCharacters > 1 ? 's' : ''} lang zijn.`;
  }
}
