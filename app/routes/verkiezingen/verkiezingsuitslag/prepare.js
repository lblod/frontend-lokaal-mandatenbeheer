import Route from '@ember/routing/route';
import RSVP from 'rsvp';

import { service } from '@ember/service';

export default class PrepareInstallatievergaderingRoute extends Route {
  @service store;

  queryParams = {
    filter: { refreshModel: true },
    sort: { refreshModel: true },
  };

  async model(params) {
    const parentModel = this.modelFor('verkiezingen.verkiezingsuitslag');
    const bestuursorgaan =
      await parentModel.installatievergadering.bestuursorgaanInTijd;

    let mandatarissen;
    if (bestuursorgaan) {
      mandatarissen = await this.getMandatarissen(params, bestuursorgaan);
    }

    let kandidatenlijsten = await this.getKandidatenLijsten(bestuursorgaan);
    console.log(kandidatenlijsten);

    return RSVP.hash({
      ...parentModel,
      mandatarissen: mandatarissen,
      kandidatenlijsten,
    });
  }

  async getMandatarissen(params, bestuursOrgaan) {
    const queryParams = {
      sort: params.sort,
      page: {
        number: 0,
        size: 9999,
      },
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

    return this.store.query('mandataris', queryParams);
  }

  async getKandidatenLijsten(bestuursOrgaan) {
    const queryParams = {
      'filter[verkiezing][bestuursorgaan-in-tijd][id]': bestuursOrgaan.id,
    };

    return await this.store.query('kandidatenlijst', queryParams);
  }
}
