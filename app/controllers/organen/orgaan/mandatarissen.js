import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { restartableTask, timeout } from 'ember-concurrency';
import { SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';

export default class OrganenMandatarissenController extends Controller {
  @service router;

  @tracked filter = '';
  @tracked page = 0;
  sort = 'is-bestuurlijke-alias-van.achternaam';
  // we are folding the mandataris instances, so just pick a very high number here and hope our government is reasonable about the
  // number of mandatarisses that can exist
  size = 900000;

  @action
  addMandataris() {
    this.router.transitionTo('organen.orgaan.mandataris.new');
  }

  @restartableTask
  *search(searchData) {
    yield timeout(SEARCH_TIMEOUT);
    this.page = 0;
    this.filter = searchData;
  }
}
