import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency';

export default class MandatenbeheerMandatarisSummaryComponent extends Component {
  @service router;

  @tracked bestuursorgaanNames;

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

  get rolWithBestuurorgaanNames() {
    const rol = this.args.mandataris.bekleedt
      .get('bestuursfunctie')
      .get('label');

    if (!this.bestuursorgaanNames || this.bestuursorgaanNames === '') {
      return rol;
    }
    return `${rol} - ${this.bestuursorgaanNames}`;
  }

  setBestuursorganenForMandataris = restartableTask(async () => {
    this.bestuursorgaanNames = '';
    const names = [];
    const bestuursorganenInDeTijd =
      await this.args.mandataris.get('bekleedt.bevatIn');

    if (!bestuursorganenInDeTijd) {
      return '';
    }

    for (const orgaan of bestuursorganenInDeTijd) {
      if (!orgaan) {
        return null;
      }

      const bestuursorgaan = await orgaan.get('isTijdsspecialisatieVan');

      if (!bestuursorgaan) {
        continue;
      }

      names.push(bestuursorgaan.naam);
    }

    this.bestuursorgaanNames = names.join(', ');
  });
}
