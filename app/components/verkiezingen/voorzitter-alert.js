import Component from '@glimmer/component';

import { action } from '@ember/object';

import { consume } from 'ember-provide-consume-context';

export default class VerkiezingenVoorzitterAlertComponent extends Component {
  @consume('alert-group') alerts;

  errorMessageId = 'voorzitter-alert';

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
    if (!hasVoorzitter) {
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

    this.alerts.pushObject({
      id: this.errorMessageId,
      message: this.errorMessage,
    });
  }
}
