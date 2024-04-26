import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class PrepareInstallatievergaderingRoute extends Route {
  @service store;

  async model(params) {
    const verkiezingsuitslag = this.modelFor('verkiezingen.verkiezingsuitslag');
    const bestuursorgaan =
      await verkiezingsuitslag.installatievergadering.bestuursorgaanInTijd;

    let mandatarissen;
    if (bestuursorgaan) {
      mandatarissen = await this.store.query(
        'mandataris',
        this.getOptions(params, bestuursorgaan)
      );
      console.log(mandatarissen);
    }

    return {
      ...verkiezingsuitslag,
      mandatarissen: mandatarissen,
    };
  }

  getOptions(params, bestuursOrgaan) {
    const NO_PAGINATION = {
      number: 0,
      size: 999,
    };
    const queryParams = {
      sort: params.sort,
      page: NO_PAGINATION,
      filter: {
        bekleedt: {
          'bevat-in': {
            id: bestuursOrgaan.id,
          },
        },
      },
      include: [
        'is-bestuurlijke-alias-van',
        'bekleedt.bestuursfunctie',
        'heeft-lidmaatschap.binnen-fractie',
        'status',
      ].join(','),
    };

    if (params.filter) {
      queryParams['filter']['is-bestuurlijke-alias-van'] = params.filter;
    }

    return queryParams;
  }
}
