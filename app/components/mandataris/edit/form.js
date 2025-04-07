import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';
import { MANDATARIS_VERHINDERD_STATE } from 'frontend-lmb/utils/well-known-uris';
import { isDisabledForBestuursorgaan } from 'frontend-lmb/utils/is-fractie-selector-required';

import moment from 'moment';
import { endOfDay } from 'frontend-lmb/utils/date-manipulation';
import { getNietBekrachtigdPublicationStatus } from 'frontend-lmb/utils/get-mandataris-status';

import { trackedFunction } from 'reactiveweb/function';
import { use } from 'ember-resources';

function getStatusOptions() {
  return trackedFunction(async () => {
    return await this.mandatarisStatus.getStatusOptionsForMandate(
      this.args.mandataris.bekleedt
    );
  });
}

export default class MandatarisEditFormComponent extends Component {
  @service store;
  @service router;
  @service toaster;
  @service mandatarisStatus;
  @service('mandataris') mandatarisService;
  @service fractieApi;
  @service mandatarisApi;

  @tracked mandaat;
  @tracked mandaatError;
  @tracked status;
  @tracked replacement;
  @tracked replacementError;
  @tracked startDate;
  @tracked endDate;
  @tracked fractie;
  @tracked rangorde;

  @tracked isSecondModalOpen = false;
  @tracked reasonForChangeOptions = ['Update state', 'Corrigeer fouten'];
  @tracked vanafDate;
  @tracked reasonForChange;

  @tracked correctedMandataris = false;
  @tracked updatedStateMandataris = false;
  @tracked newMandataris;

  @tracked isRangordeModalOpen;

  @use(getStatusOptions) getStatusOptions;

  constructor() {
    super(...arguments);
    this.setInitialFormState();
  }

  @action
  async setInitialFormState() {
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

  get statusOptions() {
    return this.getStatusOptions?.value ?? [];
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
    return !this.hasChanges || this.hasErrors;
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
    this.args.toggleModal(false);
    this.isSecondModalOpen = true;
  }

  @action
  selectReasonForChange(reason) {
    this.reasonForChange = reason;
  }

  @action
  async saveForm() {
    if (this.reasonForChange == 'Corrigeer fouten') {
      await this.corrigeerFouten();
      this.correctedMandataris = true;
    } else if (this.reasonForChange == 'Update state') {
      await this.updateState();
      this.updatedStateMandataris = true;
    } else {
      showErrorToast(
        this.toaster,
        'Geen geldige reden voor aanpassing geselecteerd'
      );
      return;
    }
    this.reasonForChange = null;
    this.isSecondModalOpen = false;
  }

  @action
  cancel() {
    this.setInitialFormState();
    this.args.toggleModal(false);
    this.isSecondModalOpen = false;
  }

  @action
  goBackSecondModal() {
    this.isSecondModalOpen = false;
    this.args.toggleModal(true);
  }

  @action
  async corrigeerFouten() {
    try {
      this.args.mandataris.bekleedt = this.mandaat;
      this.args.mandataris.status = this.status;
      this.args.mandataris.start = this.startDate;
      this.args.mandataris.einde = this.endDate;
      this.args.mandataris.rangorde = this.rangorde;
      this.args.mandataris.tijkdelijkeVervangingen = [this.replacement];
      await this.args.mandataris.save();
      await this.handleFractie(this.args.mandataris);
      showSuccessToast(this.toaster, 'De mandataris werd succesvol aangepast');
    } catch (error) {
      showErrorToast(
        this.toaster,
        'Er ging iets mis bij het aanpassen van het mandaat.'
      );
    }
  }

  async updateState() {
    let promise;
    if (this.status.get('isBeeindigd')) {
      promise = this.endMandataris();
    } else {
      promise = this.changeMandatarisState();
    }

    await promise
      .then((newMandataris) => {
        showSuccessToast(
          this.toaster,
          'Status van mandaat werd succesvol aangepast.'
        );
        this.newMandataris = newMandataris;
        this.shouldOpenRangordeModal();
      })
      .catch((e) => {
        console.log(e);
        showErrorToast(
          this.toaster,
          'Er ging iets mis bij het aanpassen van de status van het mandaat.'
        );
      });
  }

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

    await this.handleFractie(newMandataris);

    await this.mandatarisApi.copyOverNonDomainResourceProperties(
      this.args.mandataris.id,
      newMandataris.id
    );

    return newMandataris;
  }

  async handleFractie(mandataris) {
    await this.mandatarisService.createNewLidmaatschap(
      mandataris,
      this.fractie
    );
    await this.fractieApi.updateCurrentFractie(mandataris.id);
    await this.mandatarisService.removeDanglingFractiesInPeriod(mandataris.id);
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

  @action
  callbackAfterUpdate() {
    if (this.newMandataris != this.args.mandataris) {
      this.router.transitionTo(
        'mandatarissen.mandataris',
        this.newMandataris.id
      );
    }
  }
}
