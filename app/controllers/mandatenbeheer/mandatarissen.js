import Controller from '@ember/controller';
import { restartableTask, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';

export default class MandatenbeheerMandatarissenController extends Controller {
  @service() router;

  @tracked filter = '';
  @tracked page = 0;
  sort = 'is-bestuurlijke-alias-van.achternaam';
  size = 20;

  get hasActiveChildRoute() {
    return (
      this.router.currentRouteName.startsWith(
        'mandatenbeheer.mandatarissen.'
      ) && this.router.currentRouteName != 'mandatenbeheer.mandatarissen.index'
    );
  }

  @restartableTask
  *search(searchData) {
    yield timeout(SEARCH_TIMEOUT);
    this.page = 0;
    this.filter = searchData;
  }

  @action
  handleAddMandatarisClick() {
    this.router.transitionTo('mandatenbeheer.mandatarissen.new');
  }

  @action
  handleBeheerFractiesClick() {
    this.router.transitionTo('mandatenbeheer.fracties');
  }

  @action
  selectPeriod(period) {
    const queryParams = {
      page: 0,
      startDate: period.startDate,
    };

    queryParams['endDate'] = period.endDate;

    this.router.transitionTo('mandatenbeheer.mandatarissen', {
      queryParams,
    });
  }
}
