import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { FRACTIETYPE_SAMENWERKINGSVERBAND } from 'frontend-lmb/utils/well-known-uris';

export default class MandatenbeheerFractiesRoute extends Route {
  @service store;

  beforeModel() {
    const mandatenbeheer = this.modelFor('mandatenbeheer');
    this.mandatenbeheer = mandatenbeheer;
  }

  model() {
    const bestuursorganenIds = this.mandatenbeheer.bestuursorganen.map((o) =>
      o.get('id')
    );

    return this.store.query('fractie', {
      sort: 'naam',
      page: { size: 1000 },
      'filter[bestuursorganen-in-tijd][id]': bestuursorganenIds.join(','),
      include: 'bestuursorganen-in-tijd',
    });
  }

  async afterModel() {
    const defaultFractieType = (
      await this.store.query('fractietype', {
        page: { size: 1 },
        'filter[:uri:]': FRACTIETYPE_SAMENWERKINGSVERBAND,
      })
    ).at(0);

    this.defaultFractieType = defaultFractieType;
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.mandatenbeheer = this.mandatenbeheer;
    controller.defaultFractieType = this.defaultFractieType;
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
