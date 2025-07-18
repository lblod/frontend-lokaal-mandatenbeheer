import Component from '@glimmer/component';

import { service } from '@ember/service';

export default class OrganenMandatarisTableComponent extends Component {
  @service currentSession;

  get showFractie() {
    return this.args.bestuursorgaan.containsPoliticalMandates;
  }
  get hidePublicationStatus() {
    return Promise.all([
      this.args.bestuursorgaan.isDecretaal,
      this.args.bestuursorgaan.isPolitieraad,
      this.args.bestuursorgaan.isBCSD,
    ]).then(([isDecretaal, isPolitieRaad, isBCSD]) => {
      return (
        !isDecretaal ||
        isPolitieRaad ||
        (!isBCSD && this.currentSession.group.isOCMW)
      );
    });
  }
  get showOwnership() {
    return this.args.bestuursorgaan.isPolitieraad;
  }
}
