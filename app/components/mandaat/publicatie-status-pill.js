import Component from '@glimmer/component';

import { getLinkToDecision } from 'frontend-lmb/models/mandataris';

export default class MandaatPublicatieStatusPillComponent extends Component {
  get isMandatarisBekrachtigd() {
    return this.args.mandataris.get('publicationStatus')
      ? this.args.mandataris.get('publicationStatus').get('isBekrachtigd')
      : true;
  }

  get linkToDecision() {
    return getLinkToDecision(this.args.mandataris);
  }
}
