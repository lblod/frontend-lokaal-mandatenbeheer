import Component from '@glimmer/component';
import { isDisabledForBestuursorgaan } from 'frontend-lmb/utils/is-fractie-selector-required';

import { service } from '@ember/service';

export default class OrganenMandatarisTableComponent extends Component {
  @service currentSession;

  get showFractie() {
    return Promise.all([
      this.args.bestuursorgaan.containsPoliticalMandates,
      isDisabledForBestuursorgaan(this.args.bestuursorgaanInTijd),
    ]).then(([isPolitical, isFractieDisabled]) => {
      return isPolitical && !isFractieDisabled;
    });
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
