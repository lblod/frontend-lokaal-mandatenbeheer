import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class MandatenbeheerMandatarisSummaryComponent extends Component {
  @service router;
  @tracked editing = false;

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
  edit() {
    this.editing = !this.editing;
  }

  @action
  linkToDetailPage() {
    this.router.transitionTo('under-construction');
  }
}
