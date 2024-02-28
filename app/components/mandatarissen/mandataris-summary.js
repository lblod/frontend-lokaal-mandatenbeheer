import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class MandatenbeheerMandatarisSummaryComponent extends Component {
  @service router;
  @tracked
  changingState = false;

  get rol() {
    return this.args.mandataris.bekleedt.get('bestuursfunctie').get('label');
  }
  get status() {
    return this.args.mandataris.status.get('label');
  }
  get fractie() {
    return this.args.mandataris.heeftLidmaatschap.get('binnenFractie')
      ? this.args.mandataris.heeftLidmaatschap.get('binnenFractie').get('naam')
      : '';
  }

  get formattedBeleidsdomein() {
    const beleidsdomeinenPromise = this.args.mandataris.beleidsdomein;
    if (!beleidsdomeinenPromise.length) {
      return [];
    }
    return beleidsdomeinenPromise.then((beleidsdomeinen) => {
      return beleidsdomeinen.map((item) => item.label).join(', ');
    });
  }

  @action
  linkToDetailPage(mandataris) {
    this.router.transitionTo('mandatarissen.mandataris', mandataris.id);
  }

  @action
  toggleChangingState() {
    this.changingState = !this.changingState;
  }

  @action
  onUpdateState() {
    this.changingState = false;
    if (this.args.onUpdate) {
      this.args.onUpdate();
    }
  }
}
