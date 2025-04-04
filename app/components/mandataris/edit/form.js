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
import { endOfDay } from 'frontend-lmb/utils/date-manipulation';
import { getNietBekrachtigdPublicationStatus } from 'frontend-lmb/utils/get-mandataris-status';

export default class MandatarisEditFormComponent extends Component {
  @service store;
  @service toaster;
  @service mandatarisStatus;
  @service('mandataris') mandatarisService;
  @service fractieApi;
  @service mandatarisApi;

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
  @tracked vanafDate;
  @tracked reasonForChange;

  @tracked isRangordeModalOpen;

  constructor() {
    super(...arguments);
    this.load.perform();
  }

  load = task({ drop: true }, async () => {
    await this.loadValues();
    this.statusOptions = await this.mandatarisStatus.getStatusOptionsForMandate(
      this.args.mandataris.bekleedt
    );
    this.isFractieSelectorRequired = await isRequiredForBestuursorgaan(
      this.args.bestuursorgaanIT
    );
  });

  @action
  async loadValues() {
    this.mandaat = await this.args.mandataris.bekleedt;
    this.status = await this.args.mandataris.status;
    this.startDate = this.args.mandataris.start;
    this.endDate = this.args.mandataris.einde;
    this.fractie = await this.args.mandataris.get(
      'heeftLidmaatschap.binnenFractie'
    );
    this.rangorde = this.args.mandataris.rangorde;
    this.replacement = null;

    this.vanafDate = new Date();
  }

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
  async saveForm() {
    if (this.reasonForChange == 'Corrigeer fouten') {
      // Add corrigeer fouten logic here
      console.log('Corrigeer fouten');
    } else if (this.reasonForChange == 'Update state') {
      this.updateState.perform();
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
    this.loadValues();
    this.args.onClose();
  }

  @action
  cancelSecondModal() {
    this.isSecondModalOpen = false;
  }

  updateState = task({ drop: true }, async () => {
    let promise;
    if (this.status.get('isBeeindigd')) {
      promise = this.endMandataris();
    } else {
      promise = this.changeMandatarisState();
    }

    await promise
      .then(() => {
        showSuccessToast(
          this.toaster,
          'Status van mandaat werd succesvol aangepast.'
        );
        this.shouldOpenRangordeModal();
      })
      .catch((e) => {
        console.log(e);
        showErrorToast(
          this.toaster,
          'Er ging iets mis bij het aanpassen van de status van het mandaat.'
        );
      });
  });

  async endMandataris() {
    this.args.mandataris.einde = endOfDay(this.vanafDate);
    return await this.args.mandataris.save();
  }

  async changeMandatarisState() {
    const endDate = this.args.mandataris.einde;
    const dateOfAction = endOfDay(this.vanafDate);

    const newMandatarisProps = await this.mandatarisService.createNewProps(
      this.args.mandataris,
      {
        start: dateOfAction,
        einde: endDate,
        status: this.status,
        publicationStatus: await getNietBekrachtigdPublicationStatus(
          this.store
        ),
      }
    );

    const newMandataris = this.store.createRecord('mandataris', {
      ...newMandatarisProps,
      rangorde: this.rangorde,
    });

    if (this.replacement) {
      newMandatarisProps.rangorde = '';
      const replacementMandataris =
        await this.mandatarisService.getOrCreateReplacement(
          this.args.mandataris,
          this.replacement,
          // passing these along because if we pass the model, relations will be
          // evaluated as of right now and we haven't saved yet
          newMandatarisProps
        );
      newMandataris.tijdelijkeVervangingen = [replacementMandataris];
    } else {
      newMandataris.tijdelijkeVervangingen =
        (await this.args.mandataris.tijdelijkeVervangingen) || [];
      newMandataris.vervangerVan =
        (await this.args.mandataris.vervangerVan) || [];
    }

    this.args.mandataris.einde = dateOfAction;
    await Promise.all([newMandataris.save(), this.args.mandataris.save()]);

    await this.mandatarisService.createNewLidmaatschap(
      newMandataris,
      this.fractie
    );
    await this.fractieApi.updateCurrentFractie(newMandataris.id);
    await this.mandatarisService.removeDanglingFractiesInPeriod(
      newMandataris.id
    );

    await this.mandatarisApi.copyOverNonDomainResourceProperties(
      this.args.mandataris.id,
      newMandataris.id
    );

    return newMandataris;
  }

  shouldOpenRangordeModal() {
    if (!this.mandaat.get('hasRangorde')) {
      return false;
    }
    if (this.status?.get('uri') !== MANDATARIS_VERHINDERD_STATE) {
      return false;
    }
    if (this.replacement) {
      this.isRangordeModalOpen = true;
    }
  }
}
