import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { BESTUURSEENHEID_CLASSIFICATIECODE_OCMW_URI } from 'frontend-lmb/utils/constants';

export default class LeidinggevendenbeheerBestuursfunctiesBestuursfunctieRoute extends Route {
  @service currentSession;
  @service router;
  @service store;

  async afterModel() {
    const bestuurseenheidClassificatie =
      this.currentSession.groupClassification;
    if (
      bestuurseenheidClassificatie.uri ===
      BESTUURSEENHEID_CLASSIFICATIECODE_OCMW_URI
    ) {
      this.router.transitionTo('leidinggevendenbeheer.bestuursfuncties.index');
    }
  }

  model(params) {
    return this.store.findRecord('bestuursfunctie', params.bestuursfunctie_id);
  }
}
