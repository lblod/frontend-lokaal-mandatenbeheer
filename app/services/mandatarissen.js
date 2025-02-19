import Service from '@ember/service';

import { service } from '@ember/service';
import { orderMandatarissenByRangorde } from 'frontend-lmb/utils/rangorde';

export default class MandatarissenService extends Service {
  @service store;
  @service bestuursperioden;
  @service toaster;

  async getActiveMandatarissenAtTime(
    params,
    bestuursorgaanInTijd,
    bestuursperiode,
    date
  ) {
    let mandatarissen = await this.getMandatarissen(
      params,
      bestuursorgaanInTijd
    );
    const isCurrentBestuursperiode =
      this.bestuursperioden.isCurrentPeriod(bestuursperiode);
    if (isCurrentBestuursperiode) {
      return mandatarissen.filter((mandataris) => {
        return mandataris.isActiveAt(date);
      });
    }
    return mandatarissen;
  }

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

  async fetchOwnership(mandatarisIds) {
    try {
      const response = await fetch(
        `/mandataris-api/mandatarissen/check-ownership?mandatarisIds=${mandatarisIds.join(',')}`,
        { method: 'GET' }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch ownership');
      }
      return response.json();
    } catch (error) {
      console.error(error);
      this.toaster.error(
        'Er is iets misgelopen bij het ophalen nagaan wie eigenaar is van welke mandataris'
      );
      return {};
    }
  }
}
