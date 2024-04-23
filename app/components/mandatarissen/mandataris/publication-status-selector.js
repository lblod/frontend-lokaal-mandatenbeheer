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

  async loadPublicationStatusOptions() {
    if (this.publicationStatus.get('isBekrachtigd')) {
      this.disabled = true;
      return;
    }

    const publicationStatuses = await this.store.findAll(
      'mandataris-publication-status-code'
    );

    this.disabled = false;
    this.publicationStatusOptions = publicationStatuses;
  }

  constructor() {
    super(...arguments);
    console.log('constructor publication-status-selector');

    this.loadPublicationStatusOptions();
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
