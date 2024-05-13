import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class MandatarissenSearchRoute extends Route {
  @service store;
  @service bestuursperioden;

  queryParams = {
    filter: { refreshModel: true },
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
    bestuursperiode: { refreshModel: true },
    bestuursfunctie: { refreshModel: true },
  };

  async model(params) {
    const options = this.getOptions(params);
    const personen = await this.store.query('persoon', options);

    const bestuursPeriods = await this.store.query('bestuursperiode', {
      sort: 'label',
    });
    let selectedPeriod = this.bestuursperioden.getRelevantPeriod(
      bestuursPeriods,
      params.bestuursperiode
    );

    const allBestuursfuncties = [];

    await Promise.all(
      personen.map(async (persoon) =>
        allBestuursfuncties.push(
          ...(await this.bestuursOrganenForPersoon(persoon))
        )
      )
    );
    const distinctBestuursfuncties = [...new Set(allBestuursfuncties)];
    console.log({ distinctBestuursfuncties });

    return {
      personen,
      bestuursPeriods,
      selectedPeriod,
    };
  }

  bestuursOrganenForPersoon = async (persoon) => {
    const allBestuursfuncties = [];
    const mandatarissen = await persoon?.isAangesteldAls;
    if (mandatarissen.length >= 1) {
      for (const mandataris of mandatarissen) {
        const mandaat = await mandataris.bekleedt;
        allBestuursfuncties.push(await mandaat.bestuursfunctie);
      }
    }

    return allBestuursfuncties;
  };

  getOptions(params) {
    const queryParams = {
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
      'filter[:has:is-aangesteld-als]': true,
      include:
        'is-aangesteld-als,is-aangesteld-als.bekleedt,is-aangesteld-als.bekleedt.bestuursfunctie',
    };

    if (params.filter && params.filter.length > 0) {
      queryParams.filter = params.filter;
    }

    return queryParams;
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.searchData = this.paramsFor('mandatarissen.search')['filter'];
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
