import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class MandatenbeheerFractiesController extends Controller {
  @service router;

  @tracked page = 0;
  sort = 'naam';
  size = 10;

  get hasActiveChildRoute() {
    return (
      this.router.currentRouteName.startsWith('mandatenbeheer.fracties.') &&
      this.router.currentRouteName != 'mandatenbeheer.fracties.index'
    );
  }

  @action
  createNewFractie() {
    this.router.transitionTo('mandatenbeheer.fracties.new');
  }

  @action
  selectPeriod(period) {
    this.router.transitionTo('mandatenbeheer.fracties', {
      queryParams: {
        startDate: period.startDate,
        endDate: period.endDate,
        page: 0,
      },
    });
  }
}
