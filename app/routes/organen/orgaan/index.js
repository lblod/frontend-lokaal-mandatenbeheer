import Route from '@ember/routing/route';

import { service } from '@ember/service';

import { BESTUURSORGAAN_FORM_ID } from 'frontend-lmb/utils/well-known-ids';
import RSVP from 'rsvp';

export default class OrganenOrgaanIndexRoute extends Route {
  @service store;
  @service semanticFormRepository;

  async model() {
    const parentModel = this.modelFor('organen.orgaan');

    const currentBestuursorgaan = await parentModel.currentBestuursorgaan;
    const mandaten = await currentBestuursorgaan.bevat;
    const [orderedMandaten, availableBestuursfuncties] = await Promise.all([
      this.orderMandaten(mandaten),
      this.computeBestuursfuncties(mandaten),
    ]);

    const bestuursorgaanFormDefinition =
      await this.semanticFormRepository.getFormDefinition(
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

    return await this.store.query('bestuursfunctie-code', {
      sort: 'label',
      'filter[:id:]': bestuursFunctiesUsed.map((b) => b.id).join(','),
      page: {
        size: 200,
      },
    });
  }
}
