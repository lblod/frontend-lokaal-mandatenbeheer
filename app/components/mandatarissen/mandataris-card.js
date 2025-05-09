import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class MandatarisCardComponent extends Component {
  @tracked editingStatus = false;

  get status() {
    return this.args.mandataris.status.get('label');
  }

  get isBekrachtigd() {
    const status = this.args.mandataris.publicationStatus;
    return !status || status.get('isBekrachtigd');
  }

  get isNietBekrachtigd() {
    const status = this.args.mandataris.publicationStatus;
    return !status || status.get('isNietBekrachtigd');
  }

  get isEffectiefBurgemeester() {
    return this.isNietBekrachtigd && this.args.mandataris.isStrictBurgemeester;
  }

  get isEffectiefLastStatus() {
    return (
      this.isNietBekrachtigd && !!this.args.effectiefIsLastPublicationStatus
    );
  }

  get fractie() {
    return this.args.mandataris.heeftLidmaatschap.get('binnenFractie')
      ? this.args.mandataris.heeftLidmaatschap.get('binnenFractie').get('naam')
      : '';
  }

  get showEditPublicationStatus() {
    return !this.isBekrachtigd;
  }

  get canEditPublicationStatus() {
    return (
      !this.isBekrachtigd &&
      !this.args.legislatuurInBehandeling &&
      !this.isEffectiefBurgemeester &&
      !this.isEffectiefLastStatus &&
      this.args.canEdit
    );
  }

  get persoon() {
    return this.args.mandataris.isBestuurlijkeAliasVan;
  }

  get vervangersDoor() {
    return this.args.mandataris.uniqueVervangersDoor;
  }

  get vervangersVan() {
    return this.args.mandataris.uniqueVervangersVan;
  }

  get lastStatusTooltipText() {
    if (this.args.legislatuurInBehandeling) {
      return 'De publicatiestatus kan niet aangepast worden als de legislatuur nog in behandeling is.';
    } else if (this.isEffectiefBurgemeester) {
      return 'Een burgemeester kan enkel bekrachtigd worden via een benoeming, dit gebeurt automatisch.';
    } else if (this.isEffectiefLastStatus) {
      return 'Deze mandataris moet niet bekrachtigd worden.';
    } else if (!this.args.canEdit) {
      return 'Je kan deze mandataris niet bewerken.';
    }

    return null;
  }

  @action
  editStatus() {
    this.editingStatus = true;
  }

  @action
  stopEditingStatus() {
    this.editingStatus = false;
  }
}
