import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { BESTUURSEENHEID_CLASSIFICATIECODE_OCMW } from 'frontend-lmb/utils/well-known-uris';

export default class LeidinggevendenBestuursfunctieFunctionarissenIndexRoute extends Route {
  @service currentSession;
  @service router;
  @service store;

  queryParams = {
    filter: { refreshModel: true },
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
  };

  async beforeModel() {
    const bestuurseenheidClassificatie =
      this.currentSession.groupClassification;
    if (
      bestuurseenheidClassificatie.uri ===
      BESTUURSEENHEID_CLASSIFICATIECODE_OCMW
    ) {
      this.router.transitionTo('leidinggevenden.index');
    }
  }

  async model(params) {
    const bestuurseenheid = this.modelFor('leidinggevenden');
    const bestuursfunctie = this.modelFor('leidinggevenden.bestuursfunctie');

    const options = this.getOptions(params, bestuursfunctie);
    const functionarissen = await this.store.query('functionaris', options);

    return {
      bestuurseenheid,
      bestuursfunctie,
      functionarissen,
    };
  }

  getOptions(params, bestuursfunctie) {
    const queryParams = {
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
      filter: {
        bekleedt: {
          id: bestuursfunctie.id,
        },
      },
      include: 'is-bestuurlijke-alias-van',
    };

    return queryParams;
  }
}
