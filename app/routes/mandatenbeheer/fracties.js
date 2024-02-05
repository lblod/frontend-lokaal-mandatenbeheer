import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { FRACTIETYPE_SAMENWERKINGSVERBAND } from 'frontend-lmb/utils/well-known-uris';

export default class MandatenbeheerFractiesRoute extends Route {
  @service store;

  async model() {
    const mandatenbeheer = this.modelFor('mandatenbeheer');
    const bestuursorganenIds = mandatenbeheer.bestuursorganen.map((o) =>
      o.get('id')
    );

    const fracties = await this.store.query('fractie', {
      sort: 'naam',
      page: { size: 1000 },
      'filter[bestuursorganen-in-tijd][id]': bestuursorganenIds.join(','),
      include: 'bestuursorganen-in-tijd',
    });
    const defaultFractieType = (
      await this.store.query('fractietype', {
        page: { size: 1 },
        'filter[:uri:]': FRACTIETYPE_SAMENWERKINGSVERBAND,
      })
    ).at(0);

    return {
      fracties,
      defaultFractieType,
      mandatenbeheer,
    };
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
