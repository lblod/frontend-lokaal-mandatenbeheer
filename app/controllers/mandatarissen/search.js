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
  @tracked selectedBestuursfuncties;
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
    this.bestuursfunctie = null;
    this.selectedBestuursfuncties = null;
    this.filter = null;
    this.searchData = null;
  }

  @action
  selectPeriod(period) {
    this.bestuursperiode = period.id;
  }

  @action
  updateFilterWithBestuursfunctie(bestuursfunctieCodes) {
    if (!bestuursfunctieCodes || bestuursfunctieCodes.length == 0) {
      this.bestuursfunctie = null;
      this.selectedBestuursfuncties = null;
      return;
    }
    this.selectedBestuursfuncties = bestuursfunctieCodes;
    this.bestuursfunctie = bestuursfunctieCodes
      .map((functie) => functie.id)
      .join(',');
  }
}
