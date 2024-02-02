import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class MandatenbeheerFractiesController extends Controller {
  @service router;

  get startDate() {
    return this.mandatenbeheer.selectedPeriod.startDate;
  }

  get endDate() {
    return this.mandatenbeheer.selectedPeriod.endDate;
  }

  get bestuurseenheid() {
    return this.mandatenbeheer.bestuurseenheid;
  }

  get bestuursorganen() {
    return this.mandatenbeheer.bestuursorganen;
  }

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
  editFractie(fractie) {
    this.router.transitionTo('mandatenbeheer.fracties.edit', fractie.id);
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
