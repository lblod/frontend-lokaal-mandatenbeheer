import Component from '@glimmer/component';

export default class VerkiezingenVoorzitterAlertComponent extends Component {
  get errorMessage() {
    if (this.args.mandatarissen.length === 0) {
      return '';
    }
    if (
      this.args.mandatarissen.length === 1 &&
      this.args.mandatarissen.at(0).isVoorzitter
    ) {
      return '';
    }
    const hasVoorzitter = this.args.mandatarissen.some(
      (mandataris) =>
        mandataris.isVoorzitter && mandataris.isBestuurlijkeAliasVan?.id
    );
    if (!hasVoorzitter) {
      return `Je hebt nog geen voorzitter voor het orgaan ${this.args.bestuursorgaanIT.get('isTijdsspecialisatieVan').get('naam')} aangeduid. Voeg hiervoor een nieuwe mandataris met het mandaat voorzitter toe.`;
    }
    return '';
  }
}
