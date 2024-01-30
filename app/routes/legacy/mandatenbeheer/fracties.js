import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { FRACTIETYPE_SAMENWERKINGSVERBAND } from 'frontend-lmb/utils/well-known-uris';

export default class MandatenbeheerFractiesRoute extends Route {
  @service store;

  beforeModel(transition) {
    transition.data.mandatenbeheer = this.modelFor('legacy.mandatenbeheer');
  }

  model(params, transition) {
    const bestuursorganenIds =
      transition.data.mandatenbeheer.bestuursorganen.map((o) => o.get('id'));

    return this.store.query('fractie', {
      sort: 'naam',
      page: { size: 1000 },
      'filter[bestuursorganen-in-tijd][id]': bestuursorganenIds.join(','),
      include: 'bestuursorganen-in-tijd',
    });
  }

  async afterModel(model, transition) {
    const defaultFractieType = (
      await this.store.query('fractietype', {
        page: { size: 1 },
        'filter[:uri:]': FRACTIETYPE_SAMENWERKINGSVERBAND,
      })
    ).at(0);

    transition.data.defaultFractieType = defaultFractieType;
  }

  setupController(controller, model, transition) {
    super.setupController(...arguments);
    controller.mandatenbeheer = transition.data.mandatenbeheer;
    controller.defaultFractieType = transition.data.defaultFractieType;
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
