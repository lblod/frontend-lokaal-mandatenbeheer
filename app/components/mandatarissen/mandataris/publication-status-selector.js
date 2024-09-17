import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { restartableTask, task, timeout } from 'ember-concurrency';
import { INPUT_DEBOUNCE } from 'frontend-lmb/utils/constants';
import { showWarningToast } from 'frontend-lmb/utils/toasts';
import { queryRecord } from 'frontend-lmb/utils/query-record';

export default class MandatarissenMandatarisPublicationStatusSelectorComponent extends Component {
  @service store;
  @service toaster;

  @tracked options = [];
  @tracked isDisabled = false;
  @tracked showLinkToDecisionModal;
  @tracked selectedType;
  @tracked selectedDecisionPredicate;
  @tracked linkToDecision;
  @tracked isLinkToPage;
  @tracked selectedPublicationStatus;
  @tracked isInputLinkValid;

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
    // eslint-disable-next-line no-useless-escape, prettier/prettier
    const uriRegex = new RegExp(
      '^https?://[a-zA-Z0-9-]+(.[a-zA-Z0-9-]+)*(/.*)?$'
    );
    return uriRegex.test(inputValue);
  }

  setLinkTodecision = restartableTask(async (event) => {
    await timeout(INPUT_DEBOUNCE);
    this.linkToDecision = event.target?.value;
    this.isInputLinkValid = this.isValidUri(this.linkToDecision);
  });

  addDecisionToMandataris = task(async () => {
    if (this.selectedType.id === 3) {
      this.mandataris.linkToBesluit = this.linkToDecision;
      await this.mandataris.save();
      this.showLinkToDecisionModal = false;
      await this.setStatus(this.selectedPublicationStatus);
    } else {
      const searchModel = this.selectedType.id === 1 ? 'artikel' : 'besluit';
      const rechtsgrondenWithUri = await queryRecord(this.store, searchModel, {
        filter: {
          ':uri:':
            'http://data.lblod.info/id/besluiten/66E955D2FD74B81251EBA605',
        },
      });
      if (!rechtsgrondenWithUri) {
        showWarningToast(
          this.toaster,
          'Geen besluit of artikel gevonden voor deze uri',
          'Geen resultaat'
        );
      }
      alert('We did nothing with the link to besluit/artikel');
    }
  });

  get canSaveLinkToDecision() {
    if (this.selectedType?.id !== 3) {
      if (!this.selectedDecisionPredicate) {
        return false;
      }
    }

    return this.isInputLinkValid && this.selectedType;
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
