import Controller from '@ember/controller';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';

export default class MandatarissenSearchController extends Controller {
  queryParams = ['sort', 'bestuursperiode', 'bestuursfunctie', 'binnenFractie'];

  @service router;

  @tracked bestuursperiode;
  @tracked bestuursfunctie;
  @tracked binnenFractie;
  @tracked searchData;

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
    this.filter = null;
    this.searchData = null;
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
  updateFilterWithFractie(fracties) {
    this.binnenFractie = fracties.map((fractie) => fractie.id).join(',');
  }

  get selectedFracties() {
    const fractieIds = [...new Set(this.model.selectedFracties?.split(','))];

    if (fractieIds.length == this.model.fracties.length) {
      return [];
    }

    const fracties = fractieIds.map((id) =>
      this.model.fracties.find((fractie) => fractie.id == id)
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
