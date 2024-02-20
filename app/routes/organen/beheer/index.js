import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OrganenbeheerIndexRoute extends Route {
  @service store;

  pageSize = 50;
  queryParams = {
    active_sort: { refreshModel: true },
    inactive_sort: { refreshModel: true },
  };

  async model(params) {
    const parentModel = this.modelFor('organen');

    const active_options = this.getActiveOptions(
      params,
      parentModel.bestuurseenheid
    );
    const activeOrganenUnfiltered = await this.store.query(
      'bestuursorgaan',
      active_options
    );
    const activeOrganen = [];
    await Promise.all(
      activeOrganenUnfiltered.map(async (orgaan) => {
        const isDecretaal = await orgaan.isDecretaal;
        if (!isDecretaal) {
          activeOrganen.push(orgaan);
        }
      })
    );

    const inactive_options = this.getInactiveOptions(
      params,
      parentModel.bestuurseenheid
    );
    const inactiveOrganenUnfiltered = await this.store.query(
      'bestuursorgaan',
      inactive_options
    );
    const inactiveOrganen = [];
    await Promise.all(
      inactiveOrganenUnfiltered.map(async (orgaan) => {
        const isDecretaal = await orgaan.isDecretaal;
        if (!isDecretaal) {
          inactiveOrganen.push(orgaan);
        }
      })
    );

    return {
      activeOrganen,
      inactiveOrganen,
    };
  }

  getActiveOptions(params, bestuurseenheid) {
    const queryParams = {
      sort: params.active_sort,
      page: {
        size: this.pageSize,
      },
      filter: {
        bestuurseenheid: {
          id: bestuurseenheid.id,
        },
      },
    };
    queryParams['filter[:has-no:deactivated-at]'] = true;
    return queryParams;
  }

  getInactiveOptions(params, bestuurseenheid) {
    const queryParams = {
      sort: params.inactive_sort,
      page: {
        size: this.pageSize,
      },
      filter: {
        bestuurseenheid: {
          id: bestuurseenheid.id,
        },
      },
    };
    queryParams['filter[:has:deactivated-at]'] = true;
    return queryParams;
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
