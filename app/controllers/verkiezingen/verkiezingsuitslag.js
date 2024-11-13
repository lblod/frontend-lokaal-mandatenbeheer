import Controller from '@ember/controller';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { task, timeout } from 'ember-concurrency';
import { SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';

export default class VerkiezingenVerkiezingsuitslagController extends Controller {
  @service router;
  @service store;

  @tracked filter = '';
  @tracked page = 0;
  sort = 'plaats-rangorde';
  size = 20;

  @tracked searchData;

  get getYear() {
    return this.model.verkiezing.datum.getFullYear();
  }

  get downloadLink() {
    return `/election-results-api/${this.model.verkiezing.id}/download`;
  }

  search = task({ restartable: true }, async (searchData) => {
    await timeout(SEARCH_TIMEOUT);
    this.page = 0;
    this.filter = searchData;
  });
}
