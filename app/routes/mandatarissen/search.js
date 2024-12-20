import Route from '@ember/routing/route';

import { action } from '@ember/object';
import { service } from '@ember/service';
import {
  placeholderNietBeschikbaar,
  placeholderOnafhankelijk,
} from 'frontend-lmb/utils/constants';

export default class MandatarissenSearchRoute extends Route {
  @service currentSession;
  @service store;
  @service bestuursperioden;
  @service fractieApi;

  queryParams = {
    filter: { refreshModel: true },
    sort: { refreshModel: true },
    bestuursperiode: { refreshModel: true },
    bestuursfunctie: { refreshModel: true },
    binnenFractie: { refreshModel: true },
    onafhankelijkeFractie: { refreshModel: true },
    fractieNietBeschikbaar: { refreshModel: true },
    activeMandatarissen: { refreshModel: true },
  };

  async model(params) {
    const bestuursPeriods = await this.store.query('bestuursperiode', {
      sort: 'label',
      include: [
        'installatievergaderingen',
        'installatievergaderingen.status',
      ].join(','),
    });
    let selectedPeriod = this.bestuursperioden.getRelevantPeriod(
      bestuursPeriods,
      params.bestuursperiode
    );

    const isDistrict = this.currentSession.isDistrict;
    // This map is made for disabling certain options in the powerselect
    const periodMap = await Promise.all(
      bestuursPeriods.map(async (period) => {
        const ivs = await period.installatievergaderingen;
        if (ivs.length < 1) {
          return { period, disabled: false };
        }
        const isBehandeld = await ivs.at(0).isBehandeld;
        if (isBehandeld) {
          return { period, disabled: false };
        }
        return { period, disabled: isDistrict ? false : true };
      })
    );

    const personen = await this.getPersonen(params, selectedPeriod);

    const allBestuurfunctieCodes = [];
    const mandatenVoorPeriode = await this.store.query('mandaat', {
      'filter[bevat-in][heeft-bestuursperiode][:id:]': selectedPeriod.id,
      'filter[bevat-in][is-tijdsspecialisatie-van][:has-no:original-bestuurseenheid]': true,
      include: ['bevat-in', 'bevat-in.heeft-bestuursperiode'].join(','),
    });
    for (const mandaat of mandatenVoorPeriode) {
      allBestuurfunctieCodes.push(await mandaat.bestuursfunctie);
    }

    const samenWerkendFracties =
      await this.fractieApi.samenwerkingForBestuursperiode(selectedPeriod.id);

    return {
      personen,
      bestuursPeriods: periodMap,
      selectedPeriod: { period: selectedPeriod, disabled: false },
      bestuursfuncties: [...new Set(allBestuurfunctieCodes)],
      selectedBestuurfunctieIds: params.bestuursfunctie,
      fracties: [
        ...samenWerkendFracties,
        placeholderOnafhankelijk,
        placeholderNietBeschikbaar,
      ],
      selectedFracties: params.binnenFractie,
      page: {
        number: 0,
        size: personen.length,
      },
    };
  }

  async getPersonen(params, bestuursperiode) {
    const queryParams = {
      sort: params.sort,
      page: {
        number: 0,
        size: 1000,
      },
      'filter[bekleedt][bevat-in][heeft-bestuursperiode][:id:]':
        bestuursperiode.id,
      'filter[bekleedt][bevat-in][is-tijdsspecialisatie-van][:has-no:original-bestuurseenheid]': true,
      include: [
        'is-bestuurlijke-alias-van',
        'bekleedt',
        'bekleedt.bestuursfunctie',
        'bekleedt.bevat-in.heeft-bestuursperiode',
        'heeft-lidmaatschap',
        'heeft-lidmaatschap.binnen-fractie',
      ].join(','),
    };

    if (params.filter && params.filter.length > 0) {
      queryParams['filter[is-bestuurlijke-alias-van]'] = params.filter;
    }
    if (params.bestuursfunctie) {
      queryParams['filter[bekleedt][bestuursfunctie][:id:]'] =
        params.bestuursfunctie;
    }
    if (params.binnenFractie !== null) {
      queryParams['filter[:or:][heeft-lidmaatschap][binnen-fractie][:id:]'] =
        params.binnenFractie;
    }
    if (params.fractieNietBeschikbaar) {
      queryParams['filter[:or:][:has-no:heeft-lidmaatschap]'] = true;
    }
    const mandatarissen = await this.store.query('mandataris', queryParams);
    const personen = (
      await Promise.all(
        mandatarissen.map(async (mandataris) => {
          if (!params.activeMandatarissen || (await mandataris.isActive)) {
            return await mandataris.get('isBestuurlijkeAliasVan');
          }
        })
      )
    ).filter((p) => p);
    return [...new Set(personen)];
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
