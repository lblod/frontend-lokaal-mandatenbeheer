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
    binnenFractie: { refreshModel: true },
  };

  async model(params) {
    const bestuursPeriods = await this.store.query('bestuursperiode', {
      sort: 'label',
    });
    let selectedPeriod = this.bestuursperioden.getRelevantPeriod(
      bestuursPeriods,
      params.bestuursperiode
    );

    const options = this.getOptions(
      params,
      selectedPeriod,
      params.bestuursfunctie,
      params.binnenFractie
    );
    const personen = await this.store.query('persoon', options);

    const allBestuurfunctieCodes = [];
    const mandatenVoorPeriode = await this.store.query('mandaat', {
      'filter[bevat-in][heeft-bestuursperiode][:id:]': selectedPeriod.id,
      include: ['bevat-in', 'bevat-in.heeft-bestuursperiode'].join(','),
    });
    for (const mandaat of mandatenVoorPeriode) {
      allBestuurfunctieCodes.push(await mandaat.bestuursfunctie);
    }

    const fracties = await this.store.query('fractie', {
      'filter[bestuursorganen-in-tijd][heeft-bestuursperiode][:id:]':
        selectedPeriod.id,
      include: [
        'bestuursorganen-in-tijd',
        'bestuursorganen-in-tijd.heeft-bestuursperiode',
      ].join(','),
    });

    return {
      personen,
      bestuursPeriods,
      selectedPeriod,
      bestuursfuncties: [...new Set(allBestuurfunctieCodes)],
      selectedBestuurfunctieIds: params.bestuursfunctie,
      fracties,
      selectedFracties: params.binnenFractie,
    };
  }

  getOptions(params, bestuursperiode, bestuursfunctieIds, fractieIds) {
    const queryParams = {
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
      'filter[:has:is-aangesteld-als]': true,
      'filter[is-aangesteld-als][bekleedt][bevat-in][heeft-bestuursperiode][:id:]':
        bestuursperiode.id,
      'filter[is-aangesteld-als][bekleedt][bestuursfunctie][:id:]':
        bestuursfunctieIds,
      'filter[is-aangesteld-als][heeft-lidmaatschap][binnen-fractie][:id:]':
        fractieIds,
      include: [
        'is-aangesteld-als',
        'is-aangesteld-als.bekleedt',
        'is-aangesteld-als.bekleedt.bestuursfunctie',
        'is-aangesteld-als.bekleedt.bevat-in.heeft-bestuursperiode',
        'is-aangesteld-als.heeft-lidmaatschap',
        'is-aangesteld-als.heeft-lidmaatschap.binnen-fractie',
      ].join(','),
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
