import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { BESTUURSORGAAN_FORM_ID } from 'frontend-lmb/utils/well-known-ids';
import RSVP from 'rsvp';

export default class OrganenIndexRoute extends Route {
  @service store;
  @service decretaleOrganen;
  @service bestuursperioden;

  // can't use pagination as we are filtering frontend side on optional properties, which seems to have limited support
  pageSize = 20000;
  queryParams = {
    sort: { refreshModel: true },
    activeOrgans: { refreshModel: true },
    selectedTypes: { refreshModel: true },
    bestuursperiode: { refreshModel: true },
  };

  async model(params) {
    const parentModel = this.modelFor('organen');

    const bestuursPeriods = await this.store.query('bestuursperiode', {
      sort: 'label',
    });
    let selectedPeriod = this.bestuursperioden.getRelevantPeriod(
      bestuursPeriods,
      params.bestuursperiode
    );

    const queryOptions = this.getOptions(
      parentModel.bestuurseenheid,
      params,
      selectedPeriod
    );
    const allBestuursorganen = await this.store.query(
      'bestuursorgaan',
      queryOptions
    );
    const bestuursorganen = await this.filterBestuursorganen(
      allBestuursorganen,
      params
    );
    const form = await getFormFrom(this.store, BESTUURSORGAAN_FORM_ID);

    return RSVP.hash({
      bestuurseenheid: parentModel.bestuurseenheid,
      bestuursorganen,
      form,
      bestuursPeriods,
      selectedPeriod,
    });
  }

  getOptions(bestuurseenheid, params, bestuursperiode) {
    const queryParams = {
      sort: params.sort,
      page: {
        size: this.pageSize,
      },
      'filter[bestuurseenheid][:id:]': bestuurseenheid.id,
      'filter[:has-no:is-tijdsspecialisatie-van]': true,
      'filter[heeft-tijdsspecialisaties][heeft-bestuursperiode][:id:]':
        bestuursperiode.id,
      'filter[classificatie][:id:]':
        this.decretaleOrganen.classificatieIds.join(','),
      include: 'classificatie,heeft-tijdsspecialisaties',
    };
    if (params.activeOrgans) {
      queryParams['filter[:has-no:deactivated-at]'] = true;
    }
    return queryParams;
  }

  async filterBestuursorganen(bestuursorganen, params) {
    return (
      await Promise.all(
        bestuursorganen.map(async (orgaan) => {
          const validType = (
            await Promise.all(
              params.selectedTypes.map(async (filter) => {
                return await orgaan.get(filter);
              })
            )
          ).some((val) => val);
          return { bool: validType, orgaan };
        })
      )
    )
      .filter((val) => val.bool)
      .map((val) => val.orgaan);
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
