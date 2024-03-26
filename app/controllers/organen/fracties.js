import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class FractiesController extends Controller {
  @service router;

  @tracked page = 0;
  sort = 'naam';
  size = 10;

  get hasActiveChildRoute() {
    return (
      this.router.currentRouteName.startsWith('organen.fracties.') &&
      this.router.currentRouteName != 'organen.fracties.index'
    );
  }

  @action
  createNewFractie() {
    this.router.transitionTo('organen.fracties.new');
  }

  @action
  selectPeriod(period) {
    this.router.transitionTo('organen.fracties', {
      queryParams: {
        startDate: period.startDate,
        endDate: period.endDate,
        page: 0,
      },
    });
  }
}
