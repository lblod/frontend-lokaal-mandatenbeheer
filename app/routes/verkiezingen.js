import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { BESTUURSEENHEID_CLASSIFICATIECODE_GEMEENTE } from 'frontend-lmb/utils/well-known-uris';

export default class VerkiezingenRoute extends Route {
  @service currentSession;
  @service session;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model() {
    const bestuurseenheid = this.currentSession.group;
    const bestuurseenheidClassificatie =
      this.currentSession.groupClassification;

    let isRelevant = false;
    if (
      bestuurseenheidClassificatie.uri ===
      BESTUURSEENHEID_CLASSIFICATIECODE_GEMEENTE
    ) {
      isRelevant = true;
    }
    return {
      bestuurseenheid,
      isRelevant,
    };
  }
}
