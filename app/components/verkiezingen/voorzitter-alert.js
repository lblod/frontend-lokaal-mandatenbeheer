import Component from '@glimmer/component';

import { action } from '@ember/object';

import { inject as context } from '@alexlafroscia/ember-context';

export default class VerkiezingenVoorzitterAlertComponent extends Component {
  @context('shared-key') alerts;

  errorMessageId = 'e5d452ed-a22e-41e7-8856-dbcebb3abd75';

  get errorMessage() {
    if (this.args.mandatarissen.length === 0) {
      return null;
    }
    if (
      this.args.mandatarissen.length === 1 &&
      this.args.mandatarissen.at(0).isVoorzitter
    ) {
      return null;
    }
    const hasVoorzitter = this.args.mandatarissen.some(
      (mandataris) =>
        mandataris.isVoorzitter && mandataris.isBestuurlijkeAliasVan?.id
    );
    if (hasVoorzitter) {
      return `Je hebt nog geen voorzitter voor het orgaan ${this.args.bestuursorgaanIT.get('isTijdsspecialisatieVan').get('naam')} aangeduid. Voeg hiervoor een nieuwe mandataris met het mandaat voorzitter toe.`;
    }

    return null;
  }

  @action
  onUpdate() {
    const exists = this.alerts.findBy('id', this.errorMessageId);
    if (exists) {
      this.alerts.removeObject(exists);
    }

    if (!this.errorMessage) {
      return;
    }

    let isVisible = false;
    if (!this.alerts.findBy('isVisible', true)) {
      isVisible = true;
    }

    this.alerts.pushObject({
      id: this.errorMessageId,
      message: this.errorMessage,
      isVisible,
    });
  }
}
