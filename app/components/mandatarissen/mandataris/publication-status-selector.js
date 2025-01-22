import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import {
  MANDATARIS_DRAFT_PUBLICATION_STATE,
  MANDATARIS_EFFECTIEF_PUBLICATION_STATE,
} from 'frontend-lmb/utils/well-known-uris';

import { restartableTask, task, timeout } from 'ember-concurrency';

import { INPUT_DEBOUNCE } from 'frontend-lmb/utils/constants';
import { isValidUri } from 'frontend-lmb/utils/is-valid-uri';
import { effectiefIsLastPublicationStatus } from 'frontend-lmb/utils/effectief-is-last-publication-status';
import {
  PUBLICATION_STATUS_BEKRACHTIGD_ID,
  PUBLICATION_STATUS_DRAFT_ID,
  PUBLICATION_STATUS_EFFECTIEF_ID,
} from 'frontend-lmb/utils/well-known-ids';

export default class MandatarissenMandatarisPublicationStatusSelectorComponent extends Component {
  @service store;

  @tracked options = [];
  @tracked isDisabled = false;
  @tracked showLinkToDecisionModal;
  @tracked linkToDecision;
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

    const optionIds = [
      PUBLICATION_STATUS_EFFECTIEF_ID,
      PUBLICATION_STATUS_DRAFT_ID,
    ];

    if (!(await this.effectiefIsLastStatus)) {
      optionIds.push(PUBLICATION_STATUS_BEKRACHTIGD_ID);
    }
    this.options = await this.store.query(
      'mandataris-publication-status-code',
      {
        'filter[:id:]': optionIds.join(','),
      }
    );
  }

  get effectiefIsLastStatus() {
    return effectiefIsLastPublicationStatus(this.mandataris);
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
    if (publicationStatus?.uri === MANDATARIS_EFFECTIEF_PUBLICATION_STATE) {
      this.args.mandataris.effectiefAt = new Date();
    }
    if (publicationStatus?.uri === MANDATARIS_DRAFT_PUBLICATION_STATE) {
      this.args.mandataris.effectiefAt = null;
    }

    await this.mandataris.save();
    if (this.args.onUpdate) {
      this.args.onUpdate();
    }
  }

  @action
  async cancelAddDecision() {
    this.selectedPublicationStatus = await this.mandataris.publicationStatus;
    this.showLinkToDecisionModal = false;
    if (this.args.onUpdate) {
      this.args.onUpdate();
    }
  }

  setLinkTodecision = restartableTask(async (event) => {
    await timeout(INPUT_DEBOUNCE);
    this.linkToDecision = event.target?.value;
    this.isInputLinkValid = isValidUri(this.linkToDecision);
  });

  addDecisionToMandataris = task(async () => {
    this.mandataris.linkToBesluit = this.linkToDecision;
    await this.mandataris.save();
    this.showLinkToDecisionModal = false;
    await this.setStatus(this.selectedPublicationStatus);
  });

  get toolTipText() {
    return 'Voeg een geldige link toe om deze form te kunnen opslaan.';
  }
}
