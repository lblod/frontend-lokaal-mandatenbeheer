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

    const allOrganen = await this.getOrgans(parentModel.bestuurseenheid);
    const organen = [...allOrganen];

    this.sortBy(organen, params.sort);

    return {
      organen,
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

  async getOrgans(bestuurseenheid) {
    const queryOptions = this.getOptions(bestuurseenheid);
    const organen = await this.store.query('bestuursorgaan', queryOptions);
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
