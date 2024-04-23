import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OrganenbeheerIndexRoute extends Route {
  @service store;
  @service decretaleOrganen;

  // can't use pagination as we are filtering frontend side on optional properties, which seems to have limited support
  pageSize = 20000;
  queryParams = {
    sort: { refreshModel: true },
  };

  async model(params) {
    const parentModel = this.modelFor('organen');

    const queryOptions = this.getOptions(parentModel.bestuurseenheid, params);
    const organen = await this.store.query('bestuursorgaan', queryOptions);

    return {
      organen,
    };
  }

  getOptions(bestuurseenheid, params) {
    const queryParams = {
      sort: params.sort,
      page: {
        size: this.pageSize,
      },
      filter: {
        bestuurseenheid: {
          id: bestuurseenheid.id,
        },
        classificatie: {
          id: this.decretaleOrganen.classificatieIds.join(','),
        },
      },
    };
    return queryParams;
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
