import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';

import { tracked } from '@glimmer/tracking';

import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';

export default class MandatarisEditWizard extends Component {
  @service currentSession;
  @service toaster;

  @tracked activeStepIndex = 0;
  @tracked isMandatarisVerhinderd;

  @tracked isUnsavedChangesModalOpen;
  @tracked isMandatarisStepCompleted;
  @tracked isReplacementStepCompleted;

  @tracked reasonForChangeOptions = ['Update state', 'Corrigeer fouten'];
  @tracked reasonForChange;
  @tracked replacementMandataris;
  @tracked updatedMandatarisProps;

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
      this.args.onCompleted?.();
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
    this.isUnsavedChangesModalOpen = false;
    this.args.mandataris.rollbackAttributes();
    this.activeStepIndex = 0;
    this.isMandatarisStepCompleted = false;
    this.isReplacementStepCompleted = false;
    this.reasonForChange = null;
    this.args.onDiscardChanges?.();
  }

  @action
  onSaveChanges() {
    this.isSaving = true;
    this.isSaving = false;
    showSuccessToast(this.toaster, 'Aanpassingen bewaard', 'Mandataris');
    this.args.onCompleted?.();
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
  updateReplacementStepCompleted(isCompleted, newModels) {
    this.isReplacementStepCompleted = isCompleted;
    if (isCompleted) {
      console.log({ newModels });
    }
  }

  @action
  selectReasonForChange(reason) {
    this.reasonForChange = reason;
  }
}
