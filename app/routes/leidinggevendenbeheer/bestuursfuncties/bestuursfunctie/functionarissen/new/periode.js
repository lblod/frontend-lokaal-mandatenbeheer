import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { FUNCTIONARIS_STATUS_CODE_AANGESTELD } from 'frontend-lmb/utils/well-known-uris';

export default class LeidinggevendenbeheerBestuursfunctiesBestuursfunctieFunctionarissenNewPeriodeRoute extends Route {
  @service store;

  async model(params) {
    const person = await this.store.findRecord('persoon', params.persoon_id);
    const status = await this.store.query('functionaris-status-code', {
      // aangesteld status
      filter: {
        ':uri:': FUNCTIONARIS_STATUS_CODE_AANGESTELD,
      },
      page: { size: 1 },
    });
    const bestuursfunctie = this.modelFor(
      'leidinggevendenbeheer.bestuursfuncties.bestuursfunctie'
    );

    const functionaris = await this.store.createRecord('functionaris', {
      bekleedt: bestuursfunctie,
      isBestuurlijkeAliasVan: person,
      status: status.at(0),
      start: new Date(),
    });

    this.functionaris = functionaris;

    return functionaris;
  }

  deactivate() {
    if (this.functionaris.isNew) {
      this.functionaris.destroyRecord();
    }
  }
}
