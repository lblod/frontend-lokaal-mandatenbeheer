import Route from '@ember/routing/route';

import { service } from '@ember/service';

import { foldMandatarisses } from 'frontend-lmb/utils/fold-mandatarisses';
import moment from 'moment';

export default class MandatarissenPersoonMandatenRoute extends Route {
  @service store;
  @service bestuursorganen;

  queryParams = {
    activeOnly: { refreshModel: true },
    sort: { refreshModel: true },
  };

  async model(params) {
    const parentModel = await this.modelFor('mandatarissen.persoon');
    const persoon = parentModel.persoon;
    const mandatarissen = await this.getMandatarissen(persoon, params);

    const bestuursorganen =
      await this.bestuursorganen.getAllRealPoliticalBestuursorganen();

    const foldedMandatarissen = await foldMandatarisses(params, mandatarissen);

    let filteredMandatarissen = foldedMandatarissen;
    if (params.activeOnly) {
      filteredMandatarissen = foldedMandatarissen.filter((mandataris) => {
        const now = moment();
        return (
          moment(mandataris.foldedStart).isBefore(now) &&
          (!mandataris.foldedEnd || moment(mandataris.foldedEnd).isAfter(now))
        );
      });
    }

    return {
      persoon,
      foldedMandatarissen,
      mandatarissen: filteredMandatarissen,
      bestuursorganen,
    };
  }

  async getMandatarissen(persoon, params) {
    let queryParams = {
      sort: params.sort,
      filter: {
        'is-bestuurlijke-alias-van': {
          id: persoon.id,
        },
      },
      include: [
        'is-bestuurlijke-alias-van',
        'bekleedt.bestuursfunctie',
        'beleidsdomein',
        'heeft-lidmaatschap.binnen-fractie',
      ].join(','),
    };

    return await this.store.query('mandataris', queryParams);
  }

  setupController(controller, model) {
    super.setupController(controller, model);

    controller.checkFracties.perform(model.foldedMandatarissen);
  }
}
