import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency';

export default class MandatenbeheerMandatarisSummaryComponent extends Component {
  @service router;

  @tracked bestuursOrgaanNames;

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

  get rolWithBestuurOrgaanNames() {
    const rol = this.args.mandataris.bekleedt
      .get('bestuursfunctie')
      .get('label');

    if (!this.bestuursOrgaanNames || this.bestuursOrgaanNames == '') {
      return rol;
    }
    return `${rol} - ${this.bestuursOrgaanNames}`;
  }

  @action
  linkToDetailPage(mandataris) {
    this.router.transitionTo('mandatarissen.mandataris', mandataris.id);
  }

  setBestuursOrganenForMandataris = restartableTask(async () => {
    this.bestuursOrgaanNames = '';
    const names = [];
    const bestuursOrganenInDeTijd =
      await this.args.mandataris.get('bekleedt.bevatIn');

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
}
