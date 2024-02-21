import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import {
  getBestuursPeriodsOG,
  getSelectedBestuursorgaanWithPeriods,
} from 'frontend-lmb/utils/bestuursperioden';

export default class OrganenMandatarissenRout extends Route {
  @service store;

  queryParams = {
    startDate: { refreshModel: true },
    endDate: { refreshModel: true },
    filter: { refreshModel: true },
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
  };

  async model(params) {
    const parentModel = this.modelFor('organen.orgaan');
    const bestuursOrgaan = parentModel.bestuursorgaan;

    const tijdsspecialisaties = await bestuursOrgaan.heeftTijdsspecialisaties;
    const currentBestuursOrgaanWithPeriods =
      getSelectedBestuursorgaanWithPeriods(tijdsspecialisaties, {
        startDate: params.startDate,
        endDate: params.endDate,
      });

    const bestuursPeriods = getBestuursPeriodsOG(tijdsspecialisaties);
    const selectedPeriod = {
      startDate: currentBestuursOrgaanWithPeriods.startDate,
      endDate: currentBestuursOrgaanWithPeriods.endDate,
    };
    const currentBestuursOrgaan =
      currentBestuursOrgaanWithPeriods.bestuursOrgaan;

    const options = this.getOptions(params, currentBestuursOrgaan);

    const mandatarissen = await this.store.query('mandataris', options);

    return {
      bestuursPeriods,
      selectedPeriod,
      mandatarissen,
      bestuursOrgaan,
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
      include: ['is-bestuurlijke-alias-van', 'bekleedt.bestuursfunctie'].join(
        ','
      ),
    };

    if (params.filter) {
      queryParams['filter']['is-bestuurlijke-alias-van'] = params.filter;
    }

    return queryParams;
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
