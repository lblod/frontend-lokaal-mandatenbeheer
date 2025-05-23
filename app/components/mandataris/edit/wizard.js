import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';

import { tracked } from '@glimmer/tracking';

import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';
import { endOfDay } from 'frontend-lmb/utils/date-manipulation';
import { getNietBekrachtigdPublicationStatus } from 'frontend-lmb/utils/get-mandataris-status';
import { MANDATARIS_VERHINDERD_STATE } from 'frontend-lmb/utils/well-known-uris';

export default class MandatarisEditWizard extends Component {
  @service toaster;
  @service router;
  @service store;
  @service('mandataris') mandatarisService;
  @service fractieApi;
  @service mandatarisApi;

  @tracked activeStepIndex = 0;
  @tracked isMandatarisVerhinderd;
  @tracked isSaving;

  @tracked isUnsavedChangesModalOpen;
  @tracked isRangordeModalOpen;
  @tracked isMandatarisStepCompleted;
  @tracked isReplacementStepCompleted;
  @tracked isUpdateState;
  @tracked isReplacementAdded;

  @tracked reasonForChangeOptions = ['Update state', 'Corrigeer fouten'];
  @tracked reasonForChange;
  @tracked replacementPerson;
  @tracked replacementMandataris;
  @tracked replacementProps;
  @tracked newMandataris;

  get mandatarisTitle() {
    return `Bewerk ${this.args.mandataris.bekleedt.get('bestuursfunctie').get('label')} - ${this.args.mandataris.isBestuurlijkeAliasVan.get('naam')}`;
  }

  get replacementTitle() {
    return this.replacementPerson
      ? 'Mandataris voor vervanger ' + this.replacementPerson.naam
      : 'Vervanger';
  }

  get steps() {
    return [
      {
        label: this.mandatarisTitle,
        isMandatarisStep: true,
        isStepShown: true,
        canContinueToNextStep: this.isMandatarisStepCompleted,
      },
      {
        label: this.replacementTitle,
        isReplacementStep: true,
        isStepShown:
          this.isMandatarisVerhinderd &&
          this.replacementPerson &&
          !this.replacementMandataris,
        canContinueToNextStep: this.isReplacementStepCompleted,
      },
      {
        label: 'Reden',
        isReasonStep: true,
        isStepShown: true,
        canContinueToNextStep: this.reasonForChange,
      },
    ];
  }

  get activeStep() {
    if (!this.steps[this.activeStepIndex]) {
      showErrorToast(
        this.toaster,
        `Er liep iets mis. Stap ${this.activeStepIndex} bestaat niet.`
      );
    }

    return this.steps[this.activeStepIndex];
  }

  get activeStepIsFirstStep() {
    return this.activeStepIndex === 0;
  }

  get activeStepIsFinalStep() {
    return this.activeStepIndex === this.steps.length - 1;
  }

  get isSaveButtonDisabled() {
    return !this.activeStep.canContinueToNextStep || this.isSaving;
  }

  get startForReplacement() {
    return this.args.mandatarisFormValues?.start;
  }

  get eindeForReplacement() {
    return this.args.mandatarisFormValues?.einde;
  }

  @action
  nextStep() {
    const nextStepIndex = this.activeStepIndex + 1;
    if (this.activeStepIsFinalStep) {
      return;
    }
    this.activeStepIndex = nextStepIndex;
    if (this.steps[nextStepIndex]?.isStepShown) {
      return this.steps[nextStepIndex];
    } else {
      this.nextStep();
    }
  }

  @action
  previousStep() {
    const previousStepIndex = this.activeStepIndex - 1;
    this.activeStepIndex = previousStepIndex;
    if (this.steps[previousStepIndex]?.isStepShown) {
      return this.steps[previousStepIndex];
    } else {
      this.previousStep();
    }
  }

  @action
  closeWizardSafely() {
    if (this.isMandatarisStepCompleted) {
      this.isUnsavedChangesModalOpen = true;
      return;
    }
    this.closeWizard();
  }

  @action
  closeWizard() {
    this.setWizardValuesToStepOne();
    this.args.closeWizard?.();
  }

  setWizardValuesToStepOne() {
    this.args.mandataris.rollbackAttributes();
    this.isUnsavedChangesModalOpen = false;
    this.activeStepIndex = 0;
    this.isMandatarisStepCompleted = false;
    this.isReplacementStepCompleted = false;
    this.reasonForChange = null;
  }

  @action
  async updateMandatarisStepCompleted(isCompleted, formValues) {
    if (isCompleted) {
      this.replacementPerson = formValues.replacementPerson;
      this.replacementMandataris = formValues.replacementMandataris;
    }
    this.isMandatarisStepCompleted = isCompleted;
    this.isMandatarisVerhinderd = (
      await this.args.mandatarisFormValues.status
    ).isVerhinderd;
  }

  @action
  updateReplacementStepCompleted(isCompleted, replacementProps) {
    this.isReplacementStepCompleted = isCompleted;
    if (isCompleted) {
      this.replacementProps = replacementProps;
    }
  }

  @action
  selectReasonForChange(reason) {
    this.reasonForChange = reason;
  }

  @action
  async saveChanges() {
    this.isSaving = true;
    if (this.reasonForChange == 'Corrigeer fouten') {
      await this.corrigeerFouten();
    } else if (this.reasonForChange == 'Update state') {
      await this.updateState();
    } else {
      this.isSaving = false;
      showErrorToast(
        this.toaster,
        'Geen geldige reden voor aanpassing geselecteerd'
      );
      return;
    }
    this.isSaving = false;
    this.closeWizard();
  }

  @action
  async corrigeerFouten() {
    try {
      this.args.mandataris.status = await this.args.mandatarisFormValues.status;
      this.args.mandataris.start = this.args.mandatarisFormValues.start;
      this.args.mandataris.einde = this.args.mandatarisFormValues.einde;
      this.args.mandataris.rangorde = this.args.mandatarisFormValues.rangorde;
      this.args.mandataris.tijdelijkeVervangingen = this.replacementMandataris
        ? [this.replacementMandataris]
        : [];

      await this.args.mandataris.save();
      await this.handleFractie(
        this.args.mandataris,
        this.args.mandatarisFormValues.fractie
      );
      this.isReplacementAdded = this.replacementPerson;
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
    if ((await this.args.mandatarisFormValues.status).isBeeindigd) {
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
        this.isReplacementAdded = this.replacementPerson;
        this.isUpdateState = true;
        this.shouldOpenRangordeModal();
      })
      .catch((e) => {
        this.isSaving = false;
        console.log(e);
        showErrorToast(
          this.toaster,
          'Er ging iets mis bij het aanpassen van de status van het mandaat.'
        );
      });
  }

  async endMandataris() {
    this.args.mandataris.einde = endOfDay(new Date());
    await this.args.mandataris.save();

    return this.args.mandataris;
  }

  async changeMandatarisState() {
    const newMandatarisProps = await this.mandatarisService.createNewProps(
      this.args.mandataris,
      {
        start: this.args.mandatarisFormValues.start,
        einde: this.args.mandatarisFormValues.einde,
        status: await this.args.mandatarisFormValues.status,
        publicationStatus: await getNietBekrachtigdPublicationStatus(
          this.store
        ),
      }
    );

    const newMandataris = this.store.createRecord('mandataris', {
      ...newMandatarisProps,
      rangorde: this.args.mandatarisFormValues.rangorde,
    });

    await this.handleReplacement(newMandataris);

    this.args.mandataris.einde = endOfDay(this.args.mandatarisFormValues.start);
    await Promise.all([newMandataris.save(), this.args.mandataris.save()]);

    await this.handleFractie(
      newMandataris,
      this.args.mandatarisFormValues.fractie
    );

    await this.mandatarisApi.copyOverNonDomainResourceProperties(
      this.args.mandataris.id,
      newMandataris.id
    );

    return newMandataris;
  }

  async handleReplacement(replacedMandataris) {
    if (this.replacementPerson) {
      const replacementMandataris =
        await this.mandatarisService.getOrCreateReplacement(
          this.args.mandataris,
          this.replacementPerson,
          this.replacementProps
        );
      await this.handleFractie(
        replacementMandataris,
        this.replacementProps.fractie
      );
      replacedMandataris.tijdelijkeVervangingen = [replacementMandataris];
    } else {
      replacedMandataris.tijdelijkeVervangingen =
        (await this.args.mandataris.tijdelijkeVervangingen) || [];
      replacedMandataris.vervangerVan =
        (await this.args.mandataris.vervangerVan) || [];
    }
    return this.replacementMandataris;
  }

  async handleFractie(mandataris, fractie) {
    if (
      mandataris.heeftLidmaatschap?.get('binnenFractie')?.get('uri') ===
      fractie?.uri
    ) {
      return;
    }
    await this.mandatarisService.createNewLidmaatschap(mandataris, fractie);
    await this.fractieApi.updateCurrentFractie(mandataris.id);
    await this.mandatarisService.removeDanglingFractiesInPeriod(mandataris.id);
  }

  async shouldOpenRangordeModal() {
    const mandaat = await this.newMandataris.bekleedt;
    if (!mandaat.hasRangorde) {
      return false;
    }
    if ((await this.newMandataris.status).uri !== MANDATARIS_VERHINDERD_STATE) {
      return false;
    }
    if (this.replacementPerson) {
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
