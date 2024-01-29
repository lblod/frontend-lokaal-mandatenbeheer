/* eslint-disable ember/no-mixins */
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import DataTableRouteMixin from 'ember-data-table/mixins/route';
import { BESTUURSEENHEID_CLASSIFICATIECODE_OCMW } from 'frontend-lmb/utils/well-known-uris';

export default class LeidinggevendenbeheerBestuursfunctiesBestuursfunctieFunctionarissenIndexRoute extends Route.extend(
  DataTableRouteMixin
) {
  @service currentSession;
  @service router;
  @service store;

  modelName = 'functionaris';

  async beforeModel() {
    const bestuurseenheidClassificatie =
      this.currentSession.groupClassification;
    if (
      bestuurseenheidClassificatie.uri ===
      BESTUURSEENHEID_CLASSIFICATIECODE_OCMW
    ) {
      this.router.transitionTo('leidinggevendenbeheer.bestuursfuncties.index');
    }
  }

  mergeQueryOptions() {
    this.bestuursfunctie = this.modelFor(
      'leidinggevendenbeheer.bestuursfuncties.bestuursfunctie'
    );

    return {
      'filter[bekleedt][id]': this.bestuursfunctie.id,
      include: 'is-bestuurlijke-alias-van',
    };
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.set('bestuurseenheid', this.modelFor('leidinggevendenbeheer'));
    controller.set('bestuursfunctie', this.bestuursfunctie);
  }
}
