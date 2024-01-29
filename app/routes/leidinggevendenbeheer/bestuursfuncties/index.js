import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { BESTUURSEENHEID_CLASSIFICATIECODE_OCMW } from 'frontend-lmb/utils/well-known-uris';

export default class LeidinggevendenbeheerBestuursfunctiesIndexRoute extends Route {
  @service currentSession;
  @service store;

  async model(params, transition) {
    let bestuurseenheid = this.modelFor('leidinggevendenbeheer');
    transition.data.bestuurseenheid = bestuurseenheid;

    return this.store.query('bestuursfunctie', {
      'filter[bevat-in][is-tijdsspecialisatie-van][bestuurseenheid][:id:]':
        bestuurseenheid.id,
    });
  }

  setupController(controller, model, transition) {
    super.setupController(...arguments);

    const bestuurseenheidClassificatie =
      this.currentSession.groupClassification;

    if (
      bestuurseenheidClassificatie.uri !==
      BESTUURSEENHEID_CLASSIFICATIECODE_OCMW
    ) {
      controller.allowed = true;
    }

    controller.bestuurseenheid = transition.data.bestuurseenheid;
  }
}
