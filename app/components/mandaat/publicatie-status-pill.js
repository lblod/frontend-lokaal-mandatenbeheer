import Component from '@glimmer/component';

import { service } from '@ember/service';

export default class MandaatPublicatieStatusPillComponent extends Component {
  @service('mandataris-api') mandatarisApi;

  get isMandatarisBekrachtigd() {
    return this.args.mandataris.get('publicationStatus')
      ? this.args.mandataris.get('publicationStatus').get('isBekrachtigd')
      : true;
  }

  get linkToDecision() {
    return this.getLink();
  }

  async getLink() {
    const link = await this.mandatarisApi.findDecisionUri(
      this.args.mandataris.id
    );

    return link ?? this.args.mandataris.linkToBesluit;
  }
}
