import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { RESOURCE_CACHE_TIMEOUT } from 'frontend-lmb/utils/constants';

import { timeout } from 'ember-concurrency';

export default class MandatarisExtraInfoCardComponent extends Component {
  @service router;
  @service features;

  @tracked isModalActive = false;
  @tracked formInitialized;
  @tracked isSaving;

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

  get editableFormsEnabled() {
    return this.features.isEnabled('editable-forms');
  }

  @action
  toggleModal() {
    if (this.isModalActive) {
      this.formInitialized = false;
    }

    this.isModalActive = !this.isModalActive;
  }

  @action
  async onSave() {
    this.isSaving = true;
    this.isModalActive = !this.isModalActive;
    await timeout(RESOURCE_CACHE_TIMEOUT);
    this.router.refresh();
    this.isSaving = false;
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
