import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class MandatarissenMandatarisPublicationStatusSelectorComponent extends Component {
  @service store;

  @tracked options = [];
  @tracked isDisabled = false;
  @tracked showLinkToDecisionModal;

  get mandataris() {
    return this.args.mandataris;
  }

  get publicationStatus() {
    return this.mandataris.publicationStatus;
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
    console.log(`publicationStatus`, publicationStatus);
    if (publicationStatus.isBekrachtigd) {
      this.showLinkToDecisionModal = true;
      this.isDisabled = true;
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
}
