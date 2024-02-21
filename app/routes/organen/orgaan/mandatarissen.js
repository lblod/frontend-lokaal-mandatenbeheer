import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { getCurrentBestuursorgaan } from 'frontend-lmb/utils/bestuursperioden';

export default class OrganenMandatarissenRout extends Route {
  @service store;

  queryParams = {
    filter: { refreshModel: true },
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
  };

  async model(params) {
    const parentModel = this.modelFor('organen.orgaan');
    const bestuursOrgaan = parentModel.bestuursorgaan;

    // TODO correct bestuursorgaan in de tijd still needs to be selected.
    const tijdsspecialisaties = await bestuursOrgaan.heeftTijdsspecialisaties;
    const currentBestuursOrgaan = getCurrentBestuursorgaan(tijdsspecialisaties);

    const options = this.getOptions(params, currentBestuursOrgaan);

    const mandatarissen = await this.store.query('mandataris', options);

    return {
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
