import Controller from '@ember/controller';

import { action } from '@ember/object';
import { service } from '@ember/service';
import {
  placeholderNietBeschikbaar,
  placeholderOnafhankelijk,
  SEARCH_TIMEOUT,
} from 'frontend-lmb/utils/constants';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';

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

  @tracked bestuursperiode;
  @tracked bestuursfunctie;
  @tracked binnenFractie;
  @tracked onafhankelijkeFractie;
  @tracked fractieNietBeschikbaar;
  @tracked searchData;
  @tracked activeMandatarissen = false;

  @tracked filter = '';
  sort = 'is-bestuurlijke-alias-van.achternaam';

  search = task({ restartable: true }, async (searchData) => {
    await timeout(SEARCH_TIMEOUT);
    this.filter = searchData;
  });

  @action
  clearFilters() {
    this.bestuursperiode = null;
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
  selectPeriod(periodMap) {
    this.bestuursperiode = periodMap.period.id;
  }

  @action
  updateFilterWithBestuursfunctie(bestuursfunctieCodes) {
    this.bestuursfunctie = bestuursfunctieCodes
      .map((functie) => functie.id)
      .join(',');
  }

  @action
  async updateFilterWithFractie(fracties) {
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
        await this.fractieApi.onafhankelijkeForBestuursperiode(
          this.model.selectedPeriod.period.id
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

    if (!this.model.selectedFracties) {
      return fracties;
    }

    const fractieIds = [...new Set(this.model.selectedFracties.split(','))];
    fracties = fracties.concat(
      fractieIds.map((id) =>
        this.model.fracties.find((fractie) => fractie.id == id)
      )
    );

    return fracties.filter((fractie) => fractie);
  }

  get selectedBestuursfuncties() {
    const bestuurfunctieIds = [
      ...new Set(this.model.selectedBestuurfunctieIds?.split(',')),
    ];

    if (bestuurfunctieIds.length == this.uniqueBestuurfuncties.length) {
      return [];
    }

    const bestuursfuncties = bestuurfunctieIds.map((id) =>
      this.uniqueBestuurfuncties.find((functie) => functie.id == id)
    );

    return bestuursfuncties.filter((functie) => functie);
  }

  get uniqueBestuurfuncties() {
    return this.model.bestuursfuncties.filter((functie) => functie);
  }
}
