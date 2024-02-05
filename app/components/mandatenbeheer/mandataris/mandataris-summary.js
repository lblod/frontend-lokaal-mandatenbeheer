import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class MandatenbeheerMandatarisSummaryComponent extends Component {
  @tracked editMode = false;

  get rol() {
    return this.args.mandataris.bekleedt.get('bestuursfunctie').get('label');
  }
  get status() {
    return this.args.mandataris.status.get('label');
  }
  get fractie() {
    return this.args.mandataris.heeftLidmaatschap
      .get('binnenFractie')
      .get('naam');
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
    this.editMode = !this.editMode;
    // TODO add edit mandataris logic here.
  }
}
