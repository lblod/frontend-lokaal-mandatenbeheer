import Component from '@glimmer/component';

import { service } from '@ember/service';

export default class OrganenMandatarisTableComponent extends Component {
  @service currentSession;

  get showFractie() {
    return this.args.bestuursorgaan.containsPoliticalMandates;
  }
  get hidePublicationStatus() {
    if (this.currentSession.group.isOCMW) {
      return true;
    }

    return Promise.all([
      this.args.bestuursorgaan.isDecretaal,
      this.args.bestuursorgaan.isPolitieraad,
    ]).then(([isDecretaal, isPolitieRaad]) => {
      return !isDecretaal || isPolitieRaad;
    });
  }
  get showOwnership() {
    return this.args.bestuursorgaan.isPolitieraad;
  }
}
