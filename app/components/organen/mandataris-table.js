import Component from '@glimmer/component';

export default class OrganenMandatarisTableComponent extends Component {
  get showFractie() {
    return this.args.bestuursorgaan.containsPoliticalMandates;
  }
  get hidePublicationStatus() {
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
