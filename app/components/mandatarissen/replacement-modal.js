import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { getNietBekrachtigdPublicationStatus } from 'frontend-lmb/utils/get-mandataris-status';
import {
  isDisabledForBestuursorgaan,
  isRequiredForBestuursorgaan,
} from 'frontend-lmb/utils/is-fractie-selector-required';

export default class MandatarissenReplacementModal extends Component {
  @tracked modalOpen = false;
  @tracked replacement;
  @tracked startDate;
  @tracked endDate;
  @tracked fractie;
  @tracked overlappingMandate;

  @tracked startDateError;

  @service store;
  @service('mandataris') mandatarisService;
  @service fractieApi;

  get vervangersDoor() {
    return this.args.mandataris.uniqueVervangersDoor;
  }

  get isFractieRequired() {
    return isRequiredForBestuursorgaan(this.args.bestuursorgaanIT);
  }

  get hideFractieField() {
    return isDisabledForBestuursorgaan(this.args.bestuursorgaanIT);
  }

  get showExtraFields() {
    return this.replacement && !this.overlappingMandate;
  }

  get disabled() {
    return (
      !this.overlappingMandate &&
      (!this.replacement || !this.requiredFilledIn || this.hasErrors)
    );
  }

  get requiredFilledIn() {
    return this.startDate && (!this.isFractieRequired || this.fractie);
  }

  get hasErrors() {
    return this.startDateError;
  }

  @action
  openModal() {
    this.modalOpen = true;
  }

  @action
  closeModal() {
    this.modalOpen = false;
  }

  @action
  async selectReplacement(replacement, overlap) {
    if (replacement?.id === this.args.mandataris.isBestuurlijkeAliasVan.id) {
      this.replacementError = true;
    } else {
      this.replacementError = false;
    }
    this.replacement = replacement;
    this.overlappingMandate = overlap;
  }

  @action
  updateStartDate(date, error) {
    this.startDate = date;
    this.startDateError = error;
  }

  @action
  selectFractie(newFractie) {
    this.fractie = newFractie;
  }

  @action
  async saveReplacement() {
    const newMandatarisProps = await this.mandatarisService.createNewProps(
      this.args.mandataris,
      {
        start: this.startDate,
        einde: this.endDate,
        rangorde: '',
        publicationStatus: await getNietBekrachtigdPublicationStatus(
          this.store
        ),
      }
    );
    const replacementMandataris =
      await this.mandatarisService.getOrCreateReplacement(
        this.args.mandataris,
        this.replacement,
        newMandatarisProps
      );
    this.args.mandataris.tijdelijkeVervangingen = [replacementMandataris];
    this.handleFractie(replacementMandataris);

    await this.args.mandataris.save();
    this.closeModal();
    this.args.actionWhenAddingReplacement();
  }

  @action
  async cancelReplacement() {
    await this.args.mandataris.rollbackAttributes();
    this.replacement = null;
    this.closeModal();
  }

  async handleFractie(mandataris) {
    await this.mandatarisService.createNewLidmaatschap(
      mandataris,
      this.fractie
    );
    await this.fractieApi.updateCurrentFractie(mandataris.id);
    await this.mandatarisService.removeDanglingFractiesInPeriod(mandataris.id);
  }
}
