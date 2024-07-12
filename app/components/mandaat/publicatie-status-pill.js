import Component from '@glimmer/component';

import { MANDATARIS_BEKRACHTIGD_PUBLICATION_STATE } from 'frontend-lmb/utils/well-known-uris';

export default class MandaatPublicatieStatusPillComponent extends Component {
  get isMandatarisBekrachtigd() {
    if (!this.args.mandataris.publicationStatus.label) {
      return true;
    }

    if (
      this.args.mandataris.publicationStatus.uri ===
      MANDATARIS_BEKRACHTIGD_PUBLICATION_STATE
    ) {
      return true;
    }

    return false;
  }
}
