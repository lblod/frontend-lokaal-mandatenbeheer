import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class VerkiezingenVoorzitterAlertComponent extends Component {
  @service store;

  get errorMessage() {
    if (this.args.mandatarissen.length == 0) {
      return '';
    }
    const hasVoorzitter = this.args.mandatarissen.some(
      (mandataris) =>
        mandataris.isVoorzitter && mandataris.isBestuurlijkeAliasVan?.id
    );
    if (!hasVoorzitter) {
      return 'Je hebt nog geen voorzitter voor dit orgaan aangeduid. Voeg hiervoor een nieuwe mandataris met het mandaat voorzitter toe.';
    }
    return '';
  }
}
