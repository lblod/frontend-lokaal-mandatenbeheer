import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OrganenbeheerIndexRoute extends Route {
  @service store;

  queryParams = {
    active_page: { refreshModel: true },
    active_size: { refreshModel: true },
    active_sort: { refreshModel: true },
  };

  async model(params) {
    const parentModel = this.modelFor('organen');

    const active_options = this.getActiveOptions(
      params,
      parentModel.bestuurseenheid
    );
    const active_bestuursorganen = await this.store.query(
      'bestuursorgaan',
      active_options
    );

    return {
      active_bestuursorganen,
    };
  }

  getActiveOptions(params, bestuurseenheid) {
    const queryParams = {
      sort: params.active_sort,
      page: {
        number: params.active_page,
        size: params.active_size,
      },
      filter: {
        bestuurseenheid: {
          id: bestuurseenheid.id,
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
