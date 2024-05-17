import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default class MandatarissenPersoonMandatarisRoute extends Route {
  @service store;
  @service router;

  async model(params) {
    const mandataris = await this.store.findRecord(
      'mandataris',
      params.mandataris_id
    );
    const persoon = await mandataris.isBestuurlijkeAliasVan;

    return RSVP.hash({
      mandataris,
      persoon,
    });
  }

  afterModel(model) {
    this.router.transitionTo(
      'mandatarissen.persoon.mandataris',
      model.persoon.id,
      model.mandataris.id
    );
  }
}
