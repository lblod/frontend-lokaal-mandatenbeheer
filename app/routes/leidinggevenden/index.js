import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { BESTUURSEENHEID_CLASSIFICATIECODE_OCMW } from 'frontend-lmb/utils/well-known-uris';

export default class LeidinggevendenBestuursfunctiesIndexRoute extends Route {
  @service currentSession;
  @service store;

  async model(params, transition) {
    let bestuurseenheid = this.modelFor('leidinggevenden');
    transition.data.bestuurseenheid = bestuurseenheid;

    const bestuursfunctie = await this.store.query('bestuursfunctie', {
      'filter[bevat-in][is-tijdsspecialisatie-van][bestuurseenheid][:id:]':
        bestuurseenheid.id,
    });

    const bestuurseenheidClassificatie =
      this.currentSession.groupClassification;

    let isRelevant = true;
    if (
      bestuurseenheidClassificatie.uri ===
      BESTUURSEENHEID_CLASSIFICATIECODE_OCMW
    ) {
      isRelevant = false;
    }

    return {
      bestuursfunctie,
      isRelevant,
      bestuurseenheid: transition.data.bestuurseenheid,
    };
  }
}
