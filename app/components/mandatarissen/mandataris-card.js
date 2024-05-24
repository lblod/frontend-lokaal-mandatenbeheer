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

  get vervangers() {
    return this.args.mandataris.uniqueVervangers;
  }

  get vervangenen() {
    return this.args.mandataris.uniqueVervangenen;
  }

  get skinForStatusPill() {
    if (this.status && this.status == 'Effectief') {
      return 'success';
    }

    return 'default';
  }
}
