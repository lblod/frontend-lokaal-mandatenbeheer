import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OrganenbeheerIndexRoute extends Route {
  @service store;

  queryParams = {
    filter: { refreshModel: true },
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
  };

  async model(params) {
    const parentModel = this.modelFor('organen');

    const options = this.getOptions(params, parentModel.bestuurseenheid);
    const bestuursorganen = await this.store.query('bestuursorgaan', options);

    return {
      bestuursorganen,
    };
  }

  getOptions(params, bestuurseenheid) {
    const queryParams = {
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
      filter: {
        bestuurseenheid: {
          id: bestuurseenheid.id,
        },
      },
    };

    if (params.filter) {
      queryParams['filter']['naam'] = params.filter;
    }

    return queryParams;
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
