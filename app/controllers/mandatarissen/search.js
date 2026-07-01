import Controller from '@ember/controller';

import { action } from '@ember/object';
import { service } from '@ember/service';
import {
  placeholderNietBeschikbaar,
  placeholderOnafhankelijk,
  SEARCH_TIMEOUT,
} from 'frontend-lmb/utils/constants';
import {
  FAKE_ALLE_BESTUURSPERIODE_ID,
  OVERIGE_BESTUURSPERIODE_ID,
} from 'frontend-lmb/utils/well-known-ids';
import { tracked } from '@glimmer/tracking';
import { restartableTask, task, timeout } from 'ember-concurrency';
import { task as trackedTask } from 'reactiveweb/ember-concurrency';

export default class MandatarissenSearchController extends Controller {
  queryParams = [
    'sort',
    'bestuursperiode',
    'bestuursfunctie',
    'binnenFractie',
    'onafhankelijkeFractie',
    'fractieNietBeschikbaar',
  ];

  @service router;
  @service fractieApi;
  @service store;
  @service features;
  @service decretaleOrganen;
  @service validatie;
  @service bestuursperioden;

  @tracked bestuursperiode;
  @tracked bestuursfunctie;
  @tracked binnenFractie;
  @tracked onafhankelijkeFractie;
  @tracked fractieNietBeschikbaar;
  @tracked searchData;
  @tracked activeMandatarissen = false;

  @tracked filter = '';
  @tracked sort = 'is-bestuurlijke-alias-van.achternaam';

  search = task({ restartable: true }, async (searchData) => {
    await timeout(SEARCH_TIMEOUT);
    this.filter = searchData;
  });

  get selectedPeriod() {
    return this.bestuursperioden.getRelevantPeriod(
      this.model.allBestuursperiodes,
      this.bestuursperiode ?? FAKE_ALLE_BESTUURSPERIODE_ID
    );
  }

  @action
  clearFilters() {
    this.bestuursperiode = this.bestuursperioden.getRelevantPeriod(
      this.model.allBestuursperiodes,
      null
    )?.id;
    this.bestuursfunctie = null;
    this.binnenFractie = null;
    this.onafhankelijkeFractie = null;
    this.fractieNietBeschikbaar = null;
    this.filter = null;
    this.searchData = null;
    this.activeMandatarissen = false;
  }

  @action
  filterActiveMandatarissen() {
    this.activeMandatarissen = !this.activeMandatarissen;
  }

  @action
  selectPeriod(period) {
    this.bestuursperiode = period.id;
  }

  @action
  updateFilterWithBestuursfunctie(bestuursfunctieCodes) {
    this.bestuursfunctie = bestuursfunctieCodes
      .map((functie) => functie.id)
      .join(',');
  }

  @action
  async updateFilterWithFractie(_fracties) {
    const fracties = Object.values(_fracties).flatMap((f) => f.models ?? f);
    this.fractieNietBeschikbaar = fracties.find(
      (fractie) => fractie.id === placeholderNietBeschikbaar.id
    )
      ? true
      : null;
    this.onafhankelijkeFractie = fracties.find(
      (fractie) => fractie.id === placeholderOnafhankelijk.id
    )
      ? true
      : null;
    if (this.onafhankelijkeFractie) {
      const onafhankelijkeFracties =
        await this.fractieApi.onafhankelijkForBestuursperiode(
          this.selectedPeriod.id
        );
      fracties.push(...onafhankelijkeFracties);
    }
    const cleanFracties = fracties.filter(
      (f) =>
        f.id !== placeholderOnafhankelijk.id &&
        f.id !== placeholderNietBeschikbaar.id
    );
    if (fracties.length === 0 && !this.onafhankelijkeFractie) {
      this.binnenFractie = null;
      return;
    }
    this.binnenFractie = cleanFracties.map((fractie) => fractie.id).join(',');
  }

  get selectedFracties() {
    let fracties = [];
    if (this.onafhankelijkeFractie) {
      fracties.push(placeholderOnafhankelijk);
    }
    if (this.fractieNietBeschikbaar) {
      fracties.push(placeholderNietBeschikbaar);
    }

    if (!this.binnenFractie) {
      return fracties;
    }

    const fractieIds = [...new Set(this.binnenFractie.split(','))];
    const matchedGroups = fractieIds
      .map((id) =>
        this.model.fracties.find((groupedFractie) =>
          groupedFractie.models
            ? groupedFractie.models.some((model) => model.id == id)
            : groupedFractie.id == id
        )
      )
      .filter((fractie) => fractie);

    const uniqueGroups = [
      ...new Map(matchedGroups.map((f) => [f.naam, f])).values(),
    ];

    fracties.push(...uniqueGroups);
    return fracties;
  }

  get selectedBestuursfuncties() {
    const bestuursfunctieIds = [...new Set(this.bestuursfunctie?.split(','))];

    if (bestuursfunctieIds.length == this.model.bestuursfuncties.length) {
      return [];
    }

    const bestuursfuncties = bestuursfunctieIds.map((id) =>
      this.model.bestuursfuncties.find((functie) => functie.id == id)
    );

    return bestuursfuncties.filter((functie) => functie);
  }

  fetchMandatarissen = restartableTask(async () => {
    return await this.getPersoonWithMandatarissen(this.selectedPeriod);
  });

  personenWithMandatarissen = trackedTask(this, this.fetchMandatarissen, () => [
    this.filter,
    this.sort,
    this.bestuursperiode,
    this.bestuursfunctie,
    this.binnenFractie,
    this.onafhankelijkeFractie,
    this.fractieNietBeschikbaar,
    this.activeMandatarissen,
  ]);

  async getPersoonWithMandatarissen(bestuursperiode) {
    const queryParams = {
      sort: this.sort,
      page: {
        number: 0,
        size: 1000,
      },
      'filter[bekleedt][bevat-in][is-tijdsspecialisatie-van][:has-no:original-bestuurseenheid]': true,
      include: [
        'is-bestuurlijke-alias-van',
        'bekleedt',
        'bekleedt.bestuursfunctie',
        'bekleedt.bevat-in.heeft-bestuursperiode',
        'bekleedt.bevat-in.is-tijdsspecialisatie-van',
        'heeft-lidmaatschap',
        'heeft-lidmaatschap.binnen-fractie',
        'status',
        'publication-status',
      ].join(','),
    };

    if (bestuursperiode?.id === FAKE_ALLE_BESTUURSPERIODE_ID) {
      queryParams[
        'filter[bekleedt][bevat-in][heeft-bestuursperiode][:not:id]'
      ] = OVERIGE_BESTUURSPERIODE_ID;
    } else {
      queryParams['filter[bekleedt][bevat-in][heeft-bestuursperiode][:id:]'] =
        bestuursperiode.id;
    }

    if (!this.features.isEnabled('custom-organen')) {
      queryParams[
        'filter[bekleedt][bevat-in][is-tijdsspecialisatie-van][classificatie][:id:]'
      ] = this.decretaleOrganen.decretaleIds.join(',');
    }

    if (this.filter && this.filter.length > 0) {
      queryParams['filter[is-bestuurlijke-alias-van]'] = this.filter;
    }
    if (this.bestuursfunctie) {
      queryParams['filter[bekleedt][bestuursfunctie][:id:]'] =
        this.bestuursfunctie;
    }
    if (this.binnenFractie !== null) {
      queryParams['filter[:or:][heeft-lidmaatschap][binnen-fractie][:id:]'] =
        this.binnenFractie;
    }
    if (this.fractieNietBeschikbaar) {
      queryParams['filter[:or:][:has-no:heeft-lidmaatschap]'] = true;
    }

    const mandatarissen = await this.store.query('mandataris', queryParams);
    const validationResults =
      await this.validatie.activeLatestValidationResults;
    const persoonWithMandatarissen = new Map();
    const persoonIds = [];
    await Promise.all(
      mandatarissen.map(async (mandataris) => {
        if (!this.activeMandatarissen || mandataris.isActive) {
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
              rowData: await this.getRowDataForMandataris(
                mandataris,
                persoon,
                bestuursperiode?.id === FAKE_ALLE_BESTUURSPERIODE_ID
              ),
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

  async getRowDataForMandataris(
    mandataris,
    persoon,
    showMandaatPeriodPill = false
  ) {
    const lidmaatschap = await mandataris.heeftLidmaatschap;
    const mandaat = await mandataris.bekleedt;
    const bestuursfunctie = await mandaat.bestuursfunctie;
    const bestuursorganenInTijd = await mandaat.bevatIn;
    const validationResults = await this.validatie.latestValidationResults;
    let bestuursorgaan = null;
    let bestuursorgaanInTijdPeriod = null;
    let periodeLabel = null;
    let fractieLabel = null;

    if (bestuursorganenInTijd.length >= 1) {
      const bestuursorgaanInTijd = bestuursorganenInTijd.at(0);
      bestuursorgaanInTijdPeriod =
        await bestuursorgaanInTijd.heeftBestuursperiode;
      bestuursorgaan = await bestuursorgaanInTijd.isTijdsspecialisatieVan;
    }
    if (!lidmaatschap) {
      fractieLabel = 'Niet beschikbaar';
    } else {
      fractieLabel = (await lidmaatschap.binnenFractie)?.naam;
    }
    if (showMandaatPeriodPill && bestuursorgaanInTijdPeriod?.label) {
      periodeLabel = bestuursorgaanInTijdPeriod.label;
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
        periodeLabel,
      },
      mandaat: {
        label: bestuursfunctie.label,
        routeModelIds: [persoon.id, mandataris.id],
      },
    };
  }
}
