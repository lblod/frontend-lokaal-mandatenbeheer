import Route from '@ember/routing/route';

import { service } from '@ember/service';

import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { MANDATARIS_NEW_FORM_ID } from 'frontend-lmb/utils/well-known-ids';
import { foldMandatarisses } from 'frontend-lmb/utils/fold-mandatarisses';

export default class OrganenMandatarissenRoute extends Route {
  @service store;

  queryParams = {
    filter: { refreshModel: true },
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
    const mandatarisNewForm = await getFormFrom(
      this.store,
      MANDATARIS_NEW_FORM_ID
    );

    return {
      mandatarissen: folded,
      bestuursorgaan: parentModel.bestuursorgaan,
      selectedBestuursperiode: parentModel.selectedBestuursperiode,
      mandatarisNewForm: mandatarisNewForm,
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
