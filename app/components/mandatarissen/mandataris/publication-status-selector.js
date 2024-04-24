import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class MandatarissenMandatarisPublicationStatusSelectorComponent extends Component {
  @tracked options = [];
  @tracked disabled = false;
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

  async loadPublicationStatusOptions() {
    const publicationStatus = await this.mandataris.publicationStatus;
    if (this.isBekrachtigd(publicationStatus)) {
      this.disabled = true;
      return;
    }

    const statuses = await this.store.findAll(
      'mandataris-publication-status-code'
    );

    this.disabled = false;
    this.options = statuses;
  }

  constructor() {
    super(...arguments);

    this.loadPublicationStatusOptions();
  }

  @action
  async onUpdate(publicationStatus) {
    if (publicationStatus.isBekrachtigd) {
      this.disabled = true;
    }
    this.mandataris.publicationStatus = publicationStatus;
    await this.mandataris.save();
  }
}
