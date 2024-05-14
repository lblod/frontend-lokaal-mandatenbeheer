import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { BESTUURSORGAAN_FORM_ID } from 'frontend-lmb/utils/well-known-ids';
import RSVP from 'rsvp';

export default class OrganenOrgaanIndexRoute extends Route {
  @service store;

  async model() {
    const parentModel = this.modelFor('organen.orgaan');

    const mandaten = await parentModel.currentBestuursorgaan.bevat;
    const [orderedMandaten, availableBestuursfuncties] = await Promise.all([
      this.orderMandaten(mandaten),
      this.computeBestuursfuncties(mandaten),
    ]);

    const bestuursorgaanFormDefinition = getFormFrom(
      this.store,
      BESTUURSORGAAN_FORM_ID
    );

    return RSVP.hash({
      bestuursorgaanFormDefinition,
      mandaten,
      orderedMandaten,
      availableBestuursfuncties,
      ...parentModel,
    });
  }

  async orderMandaten(mandaten) {
    return mandaten.slice().sort((a, b) => {
      return a.get('bestuursfunctie.label') > b.get('bestuursfunctie.label')
        ? 1
        : -1;
    });
  }

  async computeBestuursfuncties(mandaten) {
    const bestuursFunctiesUsed = await Promise.all(
      mandaten.map((m) => m.bestuursfunctie)
    );
    const allBestuursfuncties = await this.store.query('bestuursfunctie-code', {
      page: {
        size: 200,
      },
    });
    const availableBestuursfuncties = allBestuursfuncties.filter(
      (bf) => !bestuursFunctiesUsed.includes(bf)
    );
    return availableBestuursfuncties.sortBy('label');
  }
}
