import Component from '@glimmer/component';

import { effectiefIsLastPublicationStatus } from 'frontend-lmb/utils/effectief-is-last-publication-status';

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
