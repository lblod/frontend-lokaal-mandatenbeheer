/* eslint-disable ember/no-computed-properties-in-native-classes */
import Controller from '@ember/controller';
import { restartableTask, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class MandatenbeheerMandatarissenController extends Controller {
  @service() router;

  @tracked mandatenbeheer;
  @tracked filter = '';
  @tracked page = 0;
  sort = 'is-bestuurlijke-alias-van.achternaam';
  size = 20;

  get startDate() {
    return this.mandatenbeheer.startDate;
  }

  get endDate() {
    return this.mandatenbeheer.endDate;
  }

  get hasActiveChildRoute() {
    return (
      this.router.currentRouteName.startsWith(
        'legacy.mandatenbeheer.mandatarissen.'
      ) && this.router.currentRouteName != 'legacy.mandatenbeheer.mandatarissen.index'
    );
  }

  @alias('mandatenbeheer.bestuursperioden') bestuursperioden;
  @alias('mandatenbeheer.bestuurseenheid') bestuurseenheid;
  @alias('mandatenbeheer.bestuursorganen') bestuursorganen;

  @restartableTask
  *search(searchData) {
    yield timeout(300);
    this.page = 0;
    this.filter = searchData;
  }

  @action
  handleAddMandatarisClick() {
    if (this.router.currentRouteName === 'legacy.mandatenbeheer.mandatarissen.new')
      this.router.transitionTo('legacy.mandatenbeheer.mandatarissen.index');
    else this.router.transitionTo('legacy.mandatenbeheer.mandatarissen.new');
  }

  @action
  handleBeheerFractiesClick() {
    this.router.transitionTo('legacy.mandatenbeheer.fracties');
  }

  @action
  selectPeriod(period) {
    const queryParams = {
      page: 0,
      startDate: period.startDate,
    };

    queryParams['endDate'] = period.endDate;

    this.router.transitionTo('legacy.mandatenbeheer.mandatarissen', {
      queryParams,
    });
  }
}
