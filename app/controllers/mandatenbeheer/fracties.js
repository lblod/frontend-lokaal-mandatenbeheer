import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class MandatenbeheerFractiesController extends Controller {
  @service router;

  @tracked defaultFractieType;
  @tracked mandatenbeheer;

  get bestuurseenheid() {
    return this.mandatenbeheer.bestuurseenheid;
  }

  get bestuursorganen() {
    return this.mandatenbeheer.bestuursorganen;
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
