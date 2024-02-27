import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

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
    const currentBestuursOrgaan = await parentModel.currentBestuursOrgaan;

    let mandatarissen;
    if (currentBestuursOrgaan) {
      const options = this.getOptions(
        params,
        parentModel.currentBestuursOrgaan
      );

      mandatarissen = await this.store.query('mandataris', options);
    }

    return {
      mandatarissen,
      bestuursOrgaan: parentModel.bestuursorgaan,
      bestuursPeriods: parentModel.bestuursPeriods,
      selectedPeriod: parentModel.selectedPeriod,
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
