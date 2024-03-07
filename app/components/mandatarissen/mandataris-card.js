import Component from '@glimmer/component';

export default class MandatarisCardComponent extends Component {
  get rol() {
    return this.args.mandataris.bekleedt.get('bestuursfunctie').get('label');
  }
  get status() {
    return this.args.mandataris.status.get('label');
  }
  get fractie() {
    return this.args.mandataris.heeftLidmaatschap.get('binnenFractie')
      ? this.args.mandataris.heeftLidmaatschap.get('binnenFractie').get('naam')
      : '';
  }

  get formattedBeleidsdomein() {
    const beleidsdomeinenPromise = this.args.mandataris.beleidsdomein;
    if (!beleidsdomeinenPromise.length) {
      return [];
    }
    return beleidsdomeinenPromise.then((beleidsdomeinen) => {
      return beleidsdomeinen.map((item) => item.label).join(', ');
    });
  }

  get formattedVervangenDoor() {
    return this.args.mandataris.tijdelijkeVervangingen.then((replacements) => {
      return replacements
        .map((replacement) =>
          replacement.get('isBestuurlijkeAliasVan.achternaam')
        )
        .join(', ');
    });
  }

  get formattedVervangerVan() {
    return this.args.mandataris.vervangerVan.then((replaced) => {
      return replaced
        .map((mandataris) =>
          mandataris.get('isBestuurlijkeAliasVan.achternaam')
        )
        .join(', ');
    });
  }
}
