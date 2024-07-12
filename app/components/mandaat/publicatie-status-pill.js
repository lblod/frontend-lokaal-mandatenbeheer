import Component from '@glimmer/component';

export default class MandaatPublicatieStatusPillComponent extends Component {
  get isMandatarisBekrachtigd() {
    return this.args.mandataris.get('publicationStatus')
      ? this.args.mandataris.get('publicationStatus').get('isBekrachtigd')
      : true;
  }
}
