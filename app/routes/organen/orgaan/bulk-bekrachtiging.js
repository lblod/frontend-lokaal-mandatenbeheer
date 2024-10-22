import Route from '@ember/routing/route';

import { service } from '@ember/service';

import { foldMandatarisses } from 'frontend-lmb/utils/fold-mandatarisses';

export default class BulkBekrachtigingRoute extends Route {
  @service store;
  @service installatievergadering;

  queryParams = {
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
  };

  async model(params) {
    const parentModel = this.modelFor('organen.orgaan');
    const currentBestuursorgaan = await parentModel.currentBestuursorgaan;

    let mandatarissen;
    if (currentBestuursorgaan) {
      const options = this.getOptions(params, currentBestuursorgaan);

      mandatarissen = await this.store.query('mandataris', options);
    }
    const folded = await foldMandatarisses(params, mandatarissen);

    return {
      mandatarissen: folded,
      bestuursorgaan: parentModel.bestuursorgaan,
      selectedBestuursperiode: parentModel.selectedBestuursperiode,
      currentBestuursorgaan: currentBestuursorgaan,
    };
  }

  getOptions(params, bestuursOrgaan) {
    const queryParams = {
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
      filter: {
        bekleedt: {
          'bevat-in': {
            id: bestuursOrgaan.id,
          },
        },
        ':has:is-bestuurlijke-alias-van': true,
      },
      include: [
        'is-bestuurlijke-alias-van',
        'bekleedt.bestuursfunctie',
        'heeft-lidmaatschap.binnen-fractie',
        'status',
        'publication-status',
      ].join(','),
    };

    return queryParams;
  }
}
