import Component from '@glimmer/component';

import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';
import { MANDATARIS_VERHINDERD_STATE } from 'frontend-lmb/utils/well-known-uris';
import {
  isDisabledForBestuursorgaan,
  isRequiredForBestuursorgaan,
} from 'frontend-lmb/utils/is-fractie-selector-required';

import moment from 'moment';

export default class MandatarisEditFormComponent extends Component {
  @service toaster;
  @service mandatarisStatus;

  @tracked mandaat;
  @tracked mandaatError;
  @tracked status;
  @tracked statusOptions = [];
  @tracked replacement;
  @tracked replacementError;
  @tracked startDate;
  @tracked endDate;
  @tracked fractie;
  @tracked isFractieSelectorRequired;
  @tracked rangorde;

  @tracked isSecondModalOpen = false;
  @tracked reasonForChangeOptions = ['Update state', 'Corrigeer fouten'];
  @tracked reasonForChange;

  constructor() {
    super(...arguments);
    this.load.perform();
  }

  load = task({ drop: true }, async () => {
    this.mandaat = await this.args.mandataris.bekleedt;
    this.status = this.args.mandataris.status;
    this.statusOptions = await this.mandatarisStatus.getStatusOptionsForMandate(
      this.args.mandataris.bekleedt
    );
    this.startDate = this.args.mandataris.start;
    this.endDate = this.args.mandataris.einde;
    this.fractie = this.args.mandataris.get('heeftLidmaatschap.binnenFractie');
    this.isFractieSelectorRequired = await isRequiredForBestuursorgaan(
      this.args.bestuursorgaanIT
    );
    this.rangorde = this.args.mandataris.rangorde;
  });

  get hasChanges() {
    return (
      this.mandaat?.id !== this.args.mandataris.bekleedt?.id ||
      this.status?.id !== this.args.mandataris.status?.id ||
      !moment(this.startDate).isSame(moment(this.args.mandataris.start)) ||
      this.endDate !== this.args.mandataris.einde ||
      this.fractie?.id !==
        this.args.mandataris.get('heeftLidmaatschap.binnenFractie.id') ||
      this.rangorde !== this.args.mandataris.rangorde
    );
  }

  get hasErrors() {
    return this.replacementError || this.mandaatError;
  }

  get disabled() {
    return this.load.isRunning || !this.hasChanges || this.hasErrors;
  }

  get toolTipText() {
    return 'Er zijn geen wijzigingen om op te slaan.';
  }

  get showReplacement() {
    return (
      this.status.get('isVerhinderd') &&
      !this.args.mandataris.status.get('isVerhinderd')
    );
  }

  get isTerminatingMandate() {
    return this.status.get('isBeeindigd');
  }

  get showRangordeField() {
    return (
      this.mandaat.get('hasRangorde') &&
      this.status?.get('uri') !== MANDATARIS_VERHINDERD_STATE
    );
  }

  get showFractieField() {
    return isDisabledForBestuursorgaan(this.args.bestuursorgaanIT);
  }

  get mandaatLabel() {
    return this.mandaat.rangordeLabel;
  }

  get rangordePlaceholder() {
    return `Eerste ${this.mandaatLabel}`;
  }

  @action
  updateMandaat(mandaat) {
    this.mandaat = mandaat;
  }

  @action
  updateStatus(status) {
    this.status = status;
  }

  @action
  updateReplacement(newReplacement) {
    if (this.args.mandataris.isBestuurlijkeAliasVan.id === newReplacement?.id) {
      this.replacementError = true;
    } else {
      this.replacementError = false;
    }
    this.replacement = newReplacement;
  }

  @action updateFractie(newFractie) {
    this.fractie = newFractie;
  }

  @action
  updateRangorde(rangordeAsString) {
    this.rangorde = rangordeAsString;
  }

  @action
  confirmMandatarisChanges() {
    this.args.onClose();
    this.isSecondModalOpen = true;
  }

  @action
  selectReasonForChange(reason) {
    this.reasonForChange = reason;
  }

  @action
  saveForm() {
    if (this.reasonForChange == 'Corrigeer fouten') {
      // Add corrigeer fouten logic here
      console.log('Corrigeer fouten');
    } else if (this.reasonForChange == 'Update state') {
      // Add update state logic here
      console.log('Update state');
    } else {
      showErrorToast(
        this.toaster,
        'Geen geldige reden voor aanpassing geselecteerd'
      );
      return;
    }
    showSuccessToast(this.toaster, 'De mandataris werd succesvol aangepast');
    this.reasonForChange = null;
    this.isSecondModalOpen = false;
  }

  @action
  cancel() {
    this.args.onClose();
  }

  @action
  cancelSecondModal() {
    this.isSecondModalOpen = false;
  }
}
