import Component from '@glimmer/component';

export default class OrganenMandatarisTableComponent extends Component {
  get showFractie() {
    return this.args.bestuursorgaan.containsPoliticalMandates;
  }
  get hidePublicationStatus() {
    return (
      !this.args.bestuursorgaan.isDecretaal ||
      this.args.bestuursorgaan.isPolitieraad
    );
  }
  get showOwnership() {
    return this.args.bestuursorgaan.isPolitieraad;
  }
}
