import Component from '@glimmer/component';

import { restartableTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class MandatarisCardComponent extends Component {
  @tracked bestuursOrgaanNames;

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

  setBestuursOrganenForMandataris = restartableTask(async () => {
    this.bestuursOrgaanNames = '';
    const names = [];
    const bestuursOrganenInDeTijd =
      await this.mandataris.get('bekleedt.bevatIn');

    if (!bestuursOrganenInDeTijd) {
      return '';
    }

    for (const orgaan of bestuursOrganenInDeTijd) {
      if (!orgaan) {
        return null;
      }

      const bestuursOrgaan = await orgaan.get('isTijdsspecialisatieVan');

      if (!bestuursOrgaan) {
        continue;
      }

      names.push(bestuursOrgaan.naam);
    }

    this.bestuursOrgaanNames = names.join(', ');
  });

  get mandataris() {
    return this.args.mandataris;
  }
}
