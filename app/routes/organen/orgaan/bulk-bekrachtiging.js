import Route from '@ember/routing/route';

import { service } from '@ember/service';

import {
  MANDATARIS_BEKRACHTIGD_PUBLICATION_STATE,
  MANDATARIS_EFFECTIEF_PUBLICATION_STATE,
} from 'frontend-lmb/utils/well-known-uris';

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
    const effectiefIsLastStatus =
      !!(await parentModel.bestuursorgaan.isVastBureau) ||
      (await parentModel.bestuursorgaan.isRMW);

    let mandatarissen;
    let mandatarissenMap;
    if (currentBestuursorgaan) {
      const options = this.getOptions(params, currentBestuursorgaan);

      mandatarissen = await this.store.query('mandataris', options);
      mandatarissenMap = await Promise.all(
        mandatarissen.map(async (mandataris) => {
          const uri = (await mandataris.publicationStatus).uri;
          let canShowCheckbox = true;
          if (
            effectiefIsLastStatus &&
            uri === MANDATARIS_EFFECTIEF_PUBLICATION_STATE
          ) {
            canShowCheckbox = false;
          } else if (uri === MANDATARIS_BEKRACHTIGD_PUBLICATION_STATE) {
            canShowCheckbox = false;
          }
          return {
            mandataris,
            canShowCheckbox,
          };
        })
      );
    }
    return {
      mandatarissenMap,
      mandatarissen,
      effectiefIsLastStatus,
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
        'heeft-lidmaatschap',
        'heeft-lidmaatschap.binnen-fractie',
        'status',
        'publication-status',
      ].join(','),
    };

    return queryParams;
  }
}
