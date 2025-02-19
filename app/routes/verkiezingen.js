import Route from '@ember/routing/route';

import { service } from '@ember/service';

import { BESTUURSEENHEID_CLASSIFICATIECODE_GEMEENTE } from 'frontend-lmb/utils/well-known-uris';

export default class VerkiezingenRoute extends Route {
  @service currentSession;
  @service session;
  @service router;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');

    if (!this.currentSession.canAccessMandaat) {
      this.router.transitionTo('index');
    }

    if (!this.currentSession.showLegislatuurModule) {
      this.router.transitionTo('index');
    }

    if (this.currentSession.isLokaalBeheerd) {
      this.router.transitionTo('lokaal-beheerd');
    }
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
