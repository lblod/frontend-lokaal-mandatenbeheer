import Service from '@ember/service';

import { service } from '@ember/service';
import { orderMandatarissenByRangorde } from 'frontend-lmb/utils/rangorde';

export default class MandatarissenService extends Service {
  @service store;

  async getMandatarissen(params, bestuursorgaanInTijd) {
    const options = this.getOptions(params, bestuursorgaanInTijd);
    const mandatarissen = await this.store.query('mandataris', options);
    if (params.sort && params.sort.endsWith('rangorde')) {
      const reverse = params.sort[0] == '-';
      return orderMandatarissenByRangorde([...mandatarissen], null, reverse);
    }
    return mandatarissen;
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
        'heeft-lidmaatschap',
        'heeft-lidmaatschap.binnen-fractie',
        'status',
        'publication-status',
      ].join(','),
    };

    if (params.filter) {
      queryParams['filter']['is-bestuurlijke-alias-van'] = params.filter;
    }

    return queryParams;
  }
}
