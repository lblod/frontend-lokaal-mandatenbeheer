import Component from '@glimmer/component';

export default class MandatarisCardComponent extends Component {
  get status() {
    return this.args.mandataris.status.get('label');
  }
  get fractie() {
    return this.args.mandataris.heeftLidmaatschap.get('binnenFractie')
      ? this.args.mandataris.heeftLidmaatschap.get('binnenFractie').get('naam')
      : '';
  }

  get persoon() {
    return this.args.mandataris.isBestuurlijkeAliasVan;
  }

  get vervangersDoor() {
    return this.args.mandataris.uniqueVervangersDoor;
  }

  get vervangersVan() {
    return this.args.mandataris.uniqueVervangersVan;
  }

  get skinForStatusPill() {
    if (this.status && this.status == 'Effectief') {
      return 'success';
    }

    return 'default';
  }
}
