import Component from '@glimmer/component';

import { effectiefIsLastPublicationStatus } from 'frontend-lmb/utils/effectief-is-last-publication-status';
import { PUBLICATION_STATUS_EFFECTIEF_ID } from 'frontend-lmb/utils/well-known-ids';

export default class MandaatPublicatieStatusPillComponent extends Component {
  get isMandatarisBekrachtigd() {
    return this.status ? this.status.get('isBekrachtigd') : true;
  }

  get linkToDecision() {
    return this.getLink();
  }

  async getLink() {
    const link = this.args.mandataris.besluitUri;
    return link ?? this.args.mandataris.linkToBesluit;
  }

  get effectiefIsLastStatus() {
    return effectiefIsLastPublicationStatus(this.args.mandataris);
  }

  get status() {
    return this.args.mandataris.publicationStatus;
  }

  get lastStatusTooltipText() {
    if (
      this.effectiefIsLastStatus &&
      this.status?.id === PUBLICATION_STATUS_EFFECTIEF_ID
    ) {
      return 'Dit is de laatste status voor een mandataris in dit bestuursorgaan.';
    }

    return null;
  }

  async getSkinForPill(statusPromise) {
    const status = await statusPromise;
    if (status.label === 'Bekrachtigd') {
      return 'success';
    }
    if (status.label === 'Effectief') {
      if (await this.effectiefIsLastStatus) {
        return 'success';
      }
      return 'warning';
    }
    if (status.label === 'Draft') {
      return 'border';
    }

    return 'default';
  }

  get skin() {
    return this.getSkinForPill(this.status);
  }
}
