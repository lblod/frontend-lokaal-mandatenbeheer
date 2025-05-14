import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';

import { tracked } from '@glimmer/tracking';

import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';
import { endOfDay } from 'frontend-lmb/utils/date-manipulation';
import { getNietBekrachtigdPublicationStatus } from 'frontend-lmb/utils/get-mandataris-status';
import { MANDATARIS_VERHINDERD_STATE } from 'frontend-lmb/utils/well-known-uris';

export default class MandatarisEditWizard extends Component {
  @service currentSession;
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

  @tracked reasonForChangeOptions = ['Update state', 'Corrigeer fouten'];
  @tracked reasonForChange;
  @tracked updatedMandatarisProps;
  @tracked replacement;
  @tracked replacementProps;
  @tracked newMandataris;

  get mandatarisTitle() {
    return this.args.mandatarisTitle || 'Mandataris';
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
        label: 'Vervanger',
        isReplacementStep: true,
        isStepShown: this.isMandatarisVerhinderd,
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

  get bestuurseenheid() {
    return this.currentSession.group;
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
  discardChanges() {
    this.args.mandataris.rollbackAttributes();
    this.setWizardValuesToStepOne();
    this.args.onDiscardChanges?.();
  }

  setWizardValuesToStepOne() {
    this.isUnsavedChangesModalOpen = false;
    this.activeStepIndex = 0;
    this.isMandatarisStepCompleted = false;
    this.isReplacementStepCompleted = false;
    this.reasonForChange = null;
  }

  @action
  updateMandatarisStepCompleted(isCompleted, formValues) {
    this.isMandatarisStepCompleted = isCompleted;
    if (isCompleted) {
      this.updatedMandatarisProps = formValues;
    }
    this.isMandatarisVerhinderd = formValues.status.isVerhinderd;
  }

  @action
  updateReplacementStepCompleted(isCompleted, { person, replacementProps }) {
    this.isReplacementStepCompleted = isCompleted;
    if (isCompleted) {
      this.replacement = person;
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
      this.isUpdateState = true;
    } else {
      this.isSaving = false;
      showErrorToast(
        this.toaster,
        'Geen geldige reden voor aanpassing geselecteerd'
      );
      return;
    }
    this.isSaving = false;
    this.args.onCompleted?.();
    this.setWizardValuesToStepOne();
  }

  @action
  async corrigeerFouten() {
    try {
      this.args.mandataris.status = this.updatedMandatarisProps.status;
      this.args.mandataris.start = this.updatedMandatarisProps.start;
      this.args.mandataris.einde = this.updatedMandatarisProps.end;
      this.args.mandataris.rangorde = this.updatedMandatarisProps.rangorde;
      if (this.replacement) {
        this.args.mandataris.tijdelijkeVervangingen = [this.replacement];
      }
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
    if (this.updatedMandatarisProps.status.isBeeindigd) {
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
      })
      .catch((e) => {
        console.log(e);
        showErrorToast(
          this.toaster,
          'Er ging iets mis bij het aanpassen van de status van het mandaat.'
        );
      });
    await this.shouldOpenRangordeModal();
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
        start: this.updatedMandatarisProps.start,
        einde: this.updatedMandatarisProps.end,
        status: this.updatedMandatarisProps.status,
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

    this.args.mandataris.einde = endOfDay(this.startDate);
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
      this.updatedMandatarisProps.fractie
    );
    await this.fractieApi.updateCurrentFractie(mandataris.id);
    await this.mandatarisService.removeDanglingFractiesInPeriod(mandataris.id);
  }

  async shouldOpenRangordeModal() {
    const mandaat = await this.args.mandataris.bekleedt;
    if (!mandaat.hasRangorde) {
      return false;
    }
    if (
      this.updatedMandatarisProps.status.uri !== MANDATARIS_VERHINDERD_STATE
    ) {
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
