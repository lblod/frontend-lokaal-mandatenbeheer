import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class MandatarisExtraInfoCardComponent extends Component {
  @service router;

  @tracked isModalActive = false;
  @tracked formInitialized;

  get formattedBeleidsdomein() {
    const beleidsdomeinenPromise = this.args.mandataris.beleidsdomein;
    if (!beleidsdomeinenPromise.length) {
      return [];
    }
    return beleidsdomeinenPromise.then((beleidsdomeinen) => {
      return beleidsdomeinen.map((item) => item.label).join(', ');
    });
  }

  get hasBijkomendeInformatie() {
    return this.hasBeleidsdomeinen;
  }

  get hasBeleidsdomeinen() {
    if (
      this.args.mandataris.get('bekleedt').get('isBurgemeester') ||
      this.args.mandataris.get('bekleedt').get('isSchepen')
    ) {
      return true;
    } else {
      return false;
    }
  }

  @action
  toggleModal() {
    if (this.isModalActive) {
      this.formInitialized = false;
    }

    this.isModalActive = !this.isModalActive;
  }

  @action
  onSave() {
    this.isModalActive = !this.isModalActive;
    setTimeout(() => this.router.refresh(), 1000);
  }

  get disabled() {
    return !this.hasBijkomendeInformatie || !this.args.canEdit;
  }

  get toolTipText() {
    if (!this.hasBijkomendeInformatie) {
      return 'Dit type mandaat heeft geen bijkomende informatie om te bewerken.';
    }
    if (!this.args.canEdit) {
      return 'Het is niet mogelijk een mandaat aan te passen tijdens het voorbereiden van de legislatuur.';
    }
    return '';
  }
}
