import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OrganenbeheerIndexRoute extends Route {
  @service store;

  // can't use pagination as we are filtering frontend side on optional properties, which seems to have limited support
  pageSize = 20000;
  queryParams = {
    activeSort: { refreshModel: true },
    inactiveSort: { refreshModel: true },
  };

  async model(params) {
    const parentModel = this.modelFor('organen');

    const allOrgans = await this.getOrgans(parentModel.bestuurseenheid);

    const activeOrganen = allOrgans.filter((orgaan) => !orgaan.deactivatedAt);
    this.sortBy(activeOrganen, params.activeSort);

    const inactiveOrganen = allOrgans.filter((orgaan) => orgaan.deactivatedAt);
    this.sortBy(inactiveOrganen, params.inactiveSort);

    return {
      activeOrganen,
      inactiveOrganen,
    };
  }

  sortBy(organen, sort) {
    if (!sort || sort.length === 0) {
      return;
    }
    const property = sort.split('-')[0];
    const direction = sort.indexOf('-') > 0 ? -1 : 1;
    organen.sort((a, b) => {
      try {
        return direction * a.get(property).localeCompare(b.get(property));
      } catch (e) {
        // in case the property does not exist (should never happen)
        return -1;
      }
    });
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

  getOptions(bestuurseenheid) {
    const queryParams = {
      page: {
        size: this.pageSize,
      },
      filter: {
        bestuurseenheid: {
          id: bestuurseenheid.id,
        },
        'heeft-tijdsspecialisaties': {
          ':has:bevat': true,
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
