import Component from '@glimmer/component';
import { getLinkToDecision } from 'frontend-lmb/models/mandataris';

export default class MandaatPublicatieStatusPillComponent extends Component {
  constructor() {
    super(...arguments);
    console.log(`sadsad`, this.args.mandataris.getLinkToDecision);
  }
  get isMandatarisBekrachtigd() {
    return this.args.mandataris.get('publicationStatus')
      ? this.args.mandataris.get('publicationStatus').get('isBekrachtigd')
      : true;
  }

  get linkToDecision() {
    return getLinkToDecision(this.args.mandataris);
  }
}
