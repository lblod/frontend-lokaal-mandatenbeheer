import Component from '@glimmer/component';

import { MANDATARIS_BEKRACHTIGD_PUBLICATION_STATE } from 'frontend-lmb/utils/well-known-uris';
import { action } from '@ember/object';

import { tracked } from '@glimmer/tracking';

export default class MandaatPublicatieStatusPillComponent extends Component {
  @tracked isMandatarisBekrachtigd;

  @action
  async setIsMandatarisBekrachtigd() {
    const status = await this.args.mandataris.publicationStatus;
    if (!status || !status.label) {
      return true;
    }

    if (status.uri === MANDATARIS_BEKRACHTIGD_PUBLICATION_STATE) {
      return true;
    }

    return false;
  }
}
