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
  @service features;
  @service decretaleOrganen;
  @service validatie;

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
    const allBestuursperiodes = await this.store.query('bestuursperiode', {
      sort: 'label',
      include: [
        'installatievergaderingen',
        'installatievergaderingen.status',
      ].join(','),
    });
    let selectedPeriod = this.bestuursperioden.getRelevantPeriod(
      allBestuursperiodes,
      params.bestuursperiode
    );
    const { personenWithMandatarissen, persoonIds } =
      await this.getPersoonWithMandatarissen(params, selectedPeriod);
    const allBestuursfunctieCodes = [];
    const mandatenVoorPeriode = await this.store.query('mandaat', {
      'filter[bevat-in][heeft-bestuursperiode][:id:]': selectedPeriod.id,
      'filter[bevat-in][is-tijdsspecialisatie-van][:has-no:original-bestuurseenheid]': true,
      include: ['bevat-in', 'bevat-in.heeft-bestuursperiode'].join(','),
    });
    for (const mandaat of mandatenVoorPeriode) {
      allBestuursfunctieCodes.push(await mandaat.bestuursfunctie);
    }

    const samenWerkendFracties =
      await this.fractieApi.samenwerkingForBestuursperiode(selectedPeriod.id);

    return {
      personenWithMandatarissen,
      persoonIds: persoonIds,
      allBestuursperiodes,
      selectedPeriod,
      bestuursfuncties: [...new Set(allBestuursfunctieCodes)],
      selectedBestuursfunctieIds: params.bestuursfunctie,
      fracties: [
        ...samenWerkendFracties,
        placeholderOnafhankelijk,
        placeholderNietBeschikbaar,
      ],
      selectedFracties: params.binnenFractie,
      page: {
        number: 0,
        size: personenWithMandatarissen.length,
      },
    };
  }

  async getPersoonWithMandatarissen(params, bestuursperiode) {
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
        'status',
      ].join(','),
    };

    if (!this.features.isEnabled('custom-organen')) {
      queryParams[
        'filter[bekleedt][bevat-in][is-tijdsspecialisatie-van][classificatie][:id:]'
      ] = this.decretaleOrganen.decretaleIds.join(',');
    }

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
    const validationResults =
      await this.validatie.latestValidationReport?.validationresults;
    const persoonWithMandatarissen = new Map();
    const persoonIds = [];
    await Promise.all(
      mandatarissen.map(async (mandataris) => {
        if (!params.activeMandatarissen || mandataris.isActive) {
          const persoon = await mandataris.get('isBestuurlijkeAliasVan');
          if (persoon) {
            persoonIds.push(persoon.id);
            if (!persoonWithMandatarissen.has(persoon.id)) {
              persoonWithMandatarissen.set(persoon.id, {
                persoon,
                mandatarissen: [],
              });
            }
            const persoonHasMoreThanOneMandataris =
              persoonWithMandatarissen.get(persoon.id).mandatarissen.length >=
              1;

            persoonWithMandatarissen.get(persoon.id).mandatarissen.push({
              mandataris,
              hasValidationError:
                this.features.isEnabled('shacl-report') &&
                validationResults?.find((i) => i.focusNodeId == mandataris.id),
              isSubRow: persoonHasMoreThanOneMandataris,
              rowData: await this.getRowDataForMandataris(mandataris, persoon),
            });
          }
        }
      })
    );

    return {
      persoonIds: Array.from(new Set(persoonIds)),
      personenWithMandatarissen: Array.from(persoonWithMandatarissen.values()),
    };
  }

  async getRowDataForMandataris(mandataris, persoon) {
    const lidmaatschap = await mandataris.heeftLidmaatschap;
    const mandaat = await mandataris.bekleedt;
    const bestuursfunctie = await mandaat.bestuursfunctie;
    const bestuursorganenInTijd = await mandaat.bevatIn;
    const validationResults =
      await this.validatie.latestValidationReport?.validationresults;
    let bestuursorgaan = null;
    let fractieLabel = null;

    if (bestuursorganenInTijd.length >= 1) {
      const bestuursorgaanInTijd = bestuursorganenInTijd.at(0);
      bestuursorgaan = await bestuursorgaanInTijd.isTijdsspecialisatieVan;
    }
    if (!lidmaatschap) {
      fractieLabel = 'Niet beschikbaar';
    } else {
      fractieLabel = (await lidmaatschap.binnenFractie)?.naam;
    }

    return {
      mandataris: mandataris,
      hasValidationError:
        this.features.isEnabled('shacl-report') &&
        validationResults?.find((i) => i.focusNodeId == mandataris.id),
      fractie: fractieLabel,
      bestuursorgaan: {
        label: bestuursorgaan?.naam,
        routeModelId: bestuursorgaan?.id,
      },
      mandaat: {
        label: bestuursfunctie.label,
        routeModelIds: [persoon.id, mandataris.id],
      },
    };
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
