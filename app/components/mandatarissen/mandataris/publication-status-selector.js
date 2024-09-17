import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { restartableTask, task } from 'ember-concurrency';

export default class MandatarissenMandatarisPublicationStatusSelectorComponent extends Component {
  @service store;

  @tracked options = [];
  @tracked isDisabled = false;
  @tracked showLinkToDecisionModal;
  @tracked selectedType;
  @tracked selectedDecisionPredicate;
  @tracked linkToDecision;
  @tracked isLinkToPage;
  @tracked selectedPublicationStatus;

  get mandataris() {
    return this.args.mandataris;
  }

  get publicationStatus() {
    return this.selectedPublicationStatus
      ? this.selectedPublicationStatus
      : this.mandataris.publicationStatus;
  }

  get sortedOptions() {
    return [...this.options].sort((a, b) => a.order - b.order);
  }

  async loadOptions() {
    await this.checkPublicationStatus();

    this.options = await this.store.findAll(
      'mandataris-publication-status-code'
    );
  }

  constructor() {
    super(...arguments);

    this.loadOptions();
  }

  @action
  async checkPublicationStatus() {
    const publicationStatus = await this.mandataris.publicationStatus;
    this.isDisabled = publicationStatus.isBekrachtigd;
  }

  @action
  async onUpdate(publicationStatus) {
    this.selectedPublicationStatus = publicationStatus;
    if (publicationStatus.isBekrachtigd) {
      this.isDisabled = true;
      this.showLinkToDecisionModal = true;
    } else {
      await this.setStatus(publicationStatus);
    }
  }

  @action
  async setStatus(publicationStatus) {
    this.mandataris.publicationStatus = publicationStatus;
    await this.mandataris.save();
    if (this.args.onUpdate) {
      this.args.onUpdate();
    }
  }

  @action
  setType(selectedType) {
    this.selectedType = selectedType;
    this.isLinkToPage = selectedType.id === 3;
  }

  @action
  setDecisionPredicate(predicate) {
    this.selectedDecisionPredicate = predicate;
  }

  @action
  async cancelAddDecision() {
    this.selectedPublicationStatus = await this.mandataris.publicationStatus;
    this.showLinkToDecisionModal = false;
    this.args.onUpdate();
  }

  isValidUri(inputValue) {
    if (!inputValue) {
      return false;
    }

    return inputValue.trim() !== '';
  }

  setLinkTodecision = restartableTask(async (event) => {
    this.linkToDecision = event.target?.value;
  });

  addDecisionToMandataris = task(async () => {
    // Todo: look for decision URI if it exists and link it to the mandataris
  });

  get canSaveLinkToDecision() {
    return this.isValidUri(this.linkToDecision);
  }

  get typeOptions() {
    return [
      { id: 1, label: 'Artikel' },
      { id: 2, label: 'Besluit' },
      { id: 3, label: 'Link naar pagina' },
    ];
  }

  get predicateOptions() {
    return [
      { id: 1, label: 'bekrachtigtAanstellingVan' },
      { id: 2, label: 'bekrachtigtOntslagVan' },
    ];
  }
}
