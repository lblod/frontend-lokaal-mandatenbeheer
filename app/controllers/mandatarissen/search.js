import Controller from '@ember/controller';
import { restartableTask, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';

export default class MandatarissenSearchController extends Controller {
  @service router;

  @tracked filter = '';
  @tracked page = 0;
  sort = 'achternaam';
  size = 20;

  @restartableTask
  *search(searchData) {
    yield timeout(SEARCH_TIMEOUT);
    this.page = 0;
    this.filter = searchData;
  }
}
