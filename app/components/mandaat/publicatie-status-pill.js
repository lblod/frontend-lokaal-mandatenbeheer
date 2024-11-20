import Component from '@glimmer/component';

export default class MandaatPublicatieStatusPillComponent extends Component {
  get isMandatarisBekrachtigd() {
    return this.args.mandataris.get('publicationStatus')
      ? this.args.mandataris.get('publicationStatus').get('isBekrachtigd')
      : true;
  }

  get linkToDecision() {
    return this.getLink();
  }

  async getLink() {
    const link = this.args.mandataris.besluitUri;
    return link ?? this.args.mandataris.linkToBesluit;
  }
}
