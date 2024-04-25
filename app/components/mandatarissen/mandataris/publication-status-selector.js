import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class MandatarissenMandatarisPublicationStatusSelectorComponent extends Component {
  @tracked options = [];
  @tracked isDisabled = false;
  @service store;

  get mandataris() {
    return this.args.mandataris;
  }

  get publicationStatus() {
    return this.mandataris.publicationStatus;
  }

  get sortedOptions() {
    return [...this.options].sort((a, b) => a.order - b.order);
  }

  isBekrachtigd(publicationStatus) {
    return !publicationStatus || publicationStatus.isBekrachtigd;
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
    this.isDisabled = this.isBekrachtigd(publicationStatus);
  }

  @action
  async onUpdate(publicationStatus) {
    if (publicationStatus.isBekrachtigd) {
      this.isDisabled = true;
    }
    this.mandataris.publicationStatus = publicationStatus;
    await this.mandataris.save();
  }
}
