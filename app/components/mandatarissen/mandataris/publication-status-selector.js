import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class MandatarissenMandatarisPublicationStatusSelectorComponent extends Component {
  @tracked publicationStatusOptions = [];
  @tracked disabled = false;
  @service store;

  get mandataris() {
    return this.args.mandataris;
  }

  get publicationStatus() {
    return this.mandataris.publicationStatus;
  }

  isBekrachtigd(publicationStatus) {
    return !publicationStatus || publicationStatus.isBekrachtigd;
  }

  async loadPublicationStatusOptions() {
    await this.checkPublicationStatus();

    // If the publication status is bekrachtigd, we don't need to load the options
    if (this.disabled) {
      return;
    }

    const publicationStatuses = await this.store.findAll(
      'mandataris-publication-status-code'
    );

    this.publicationStatusOptions = publicationStatuses;
  }

  constructor() {
    super(...arguments);

    this.loadPublicationStatusOptions();
  }

  @action
  async checkPublicationStatus() {
    const publicationStatus = await this.mandataris.publicationStatus;
    this.disabled = this.isBekrachtigd(publicationStatus);
  }

  @action
  async onUpdatePublicationStatus(publicationStatus) {
    if (publicationStatus.isBekrachtigd) {
      this.disabled = true;
    }
    this.mandataris.publicationStatus = publicationStatus;
    await this.mandataris.save();
  }
}
