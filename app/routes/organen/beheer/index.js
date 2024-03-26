import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OrganenbeheerIndexRoute extends Route {
  @service store;

  pageSize = 100;
  queryParams = {
    activeSort: { refreshModel: true },
    inactiveSort: { refreshModel: true },
  };

  async model(params) {
    const parentModel = this.modelFor('organen');

    const activeOrganen = await this.getOrgans(
      params.activeSort,
      parentModel.bestuurseenheid
    );

    const inactiveOrganen = await this.getOrgans(
      params.inactiveSort,
      parentModel.bestuurseenheid,
      false
    );

    return {
      activeOrganen,
      inactiveOrganen,
    };
  }

  async getOrgans(sort, bestuurseenheid, active = true) {
    const queryOptions = this.getOptions(sort, bestuurseenheid, active);
    const organenUnfiltered = await this.store.query(
      'bestuursorgaan',
      queryOptions
    );
    const organen = [];
    await Promise.all(
      organenUnfiltered.map(async (orgaan) => {
        const isDecretaal = await orgaan.isDecretaal;
        if (!isDecretaal) {
          organen.push(orgaan);
        }
      })
    );
    return organen;
  }

  getOptions(sortParam, bestuurseenheid, active) {
    const queryParams = {
      sort: sortParam,
      page: {
        size: this.pageSize,
      },
      filter: {
        bestuurseenheid: {
          id: bestuurseenheid.id,
        },
      },
    };
    if (active) {
      queryParams['filter[:has-no:deactivated-at]'] = true;
    } else {
      queryParams['filter[:has:deactivated-at]'] = true;
    }
    return queryParams;
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
