import Controller from '@ember/controller';
import { action } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';

export default class MandatarissenSearchController extends Controller {
  queryParams = ['sort', 'bestuursperiode', 'bestuursfunctie'];

  @service router;

  @tracked bestuursperiode;
  @tracked bestuursfunctie;
  @tracked searchData;

  @tracked filter = '';
  @tracked page = 0;
  sort = 'achternaam';
  size = 20;

  search = task({ restartable: true }, async (searchData) => {
    await timeout(SEARCH_TIMEOUT);
    this.page = 0;
    this.filter = searchData;
  });

  @action
  clearFilters() {
    this.bestuursperiode = null;
    this.bestuursfunctie = this.allBestuurfunctieCodeIds;
    this.filter = null;
    this.searchData = null;
    this.page = 0;
  }

  @action
  selectPeriod(period) {
    this.bestuursperiode = period.id;
    this.page = 0;
  }

  @action
  updateFilterWithBestuursfunctie(bestuursfunctieCodes) {
    if (!bestuursfunctieCodes || bestuursfunctieCodes.length == 0) {
      this.bestuursfunctie = this.allBestuurfunctieCodeIds;
      return;
    }
    this.bestuursfunctie = bestuursfunctieCodes
      .map((functie) => functie.id)
      .join(',');
    this.page = 0;
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

  get allBestuurfunctieCodeIds() {
    return this.uniqueBestuurfuncties.map((code) => code.id).join(',');
  }
}
