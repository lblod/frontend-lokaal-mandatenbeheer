import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { BESTUURSORGAAN_FORM_ID } from 'frontend-lmb/utils/well-known-ids';
import moment from 'moment';

export default class OrganenIndexRoute extends Route {
  @service store;
  @service decretaleOrganen;
  @service tijdsspecialisaties;

  // can't use pagination as we are filtering frontend side on optional properties, which seems to have limited support
  pageSize = 20000;
  queryParams = {
    sort: { refreshModel: true },
    activeFilter: { refreshModel: true },
    selectedTypes: { refreshModel: true },
    startDate: { refreshModel: true },
    endDate: { refreshModel: true },
  };

  async model(params) {
    const parentModel = this.modelFor('organen');
    const organenWithPeriods =
      await this.tijdsspecialisaties.fetchBestuursOrganenWithTijdsperiods(
        parentModel.bestuursorganen,
        params
      );

    const queryOptions = this.getOptions(parentModel.bestuurseenheid, params);
    const allBestuursorganen = await this.store.query(
      'bestuursorgaan',
      queryOptions
    );
    const bestuursorganen = await this.filterBestuursorganen(
      allBestuursorganen,
      params,
      organenWithPeriods.selectedPeriod
    );
    const form = await getFormFrom(this.store, BESTUURSORGAAN_FORM_ID);

    return {
      bestuurseenheid: parentModel.bestuurseenheid,
      bestuursorganen,
      form,
      bestuursPeriods: organenWithPeriods.bestuursPeriods,
      selectedPeriod: organenWithPeriods.selectedPeriod,
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
        ':has-no:is-tijdsspecialisatie-van': true,
        classificatie: {
          id: this.decretaleOrganen.classificatieIds.join(','),
        },
      },
      include: 'classificatie,heeft-tijdsspecialisaties',
    };
    return queryParams;
  }

  async filterBestuursorganen(bestuursorganen, params, bestuursPeriod) {
    if (params.activeFilter) {
      bestuursorganen = bestuursorganen.filter((orgaan) => {
        return orgaan.isActive;
      });
    }
    const tmp2 = await Promise.all(
      bestuursorganen.map(async (orgaan) => {
        const tmp = await Promise.all(
          params.selectedTypes.map(async (filter) => {
            return await orgaan.get(filter);
          })
        );
        const some = tmp.some((val) => {
          return val;
        });
        const tijdsspecialisaties = await orgaan.heeftTijdsspecialisaties;
        const time = await tijdsspecialisaties.some((b) => {
          return (
            moment(b.bindingStart).format('YYYY-MM-DD') ==
            bestuursPeriod.startDate
          );
        });
        return { bool: some && time, orgaan };
      })
    );
    return tmp2.filter((val) => val.bool).map((val) => val.orgaan);
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
