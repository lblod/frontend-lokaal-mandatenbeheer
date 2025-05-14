import Component from '@glimmer/component';

import { action } from '@ember/object';

import { tracked } from '@glimmer/tracking';

import { showErrorToast } from 'frontend-lmb/utils/toasts';

export default class MandatarisEditWizard extends Component {
  @tracked activeStepIndex = 0;
  @tracked isMandatarisVerhinderd;
  @tracked isMandatarisStepCompleted;

  @tracked reasonForChangeOptions = ['Update state', 'Corrigeer fouten'];
  @tracked reasonForChange;

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
        canContinueToNextStep: true,
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

  get nextButtonText() {
    if (this.activeStepIsFinalStep) {
      return 'Pas aan';
    }

    return 'Volgende stap';
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
  onCloseModal() {
    alert('check if there are changes and show a popup that says are you sure');
    this.args.onCompleted?.();
    this.args.onAbort?.();
  }

  @action
  updateMandatarisStepCompleted(isCompleted, formValues) {
    this.isMandatarisStepCompleted = isCompleted;
    if (isCompleted) {
      this.args.mandataris.status = formValues.status;
      this.args.mandataris.rangorde = formValues.rangorde;
      this.args.mandataris.fractie = formValues.fractie;
      this.args.mandataris.start = formValues.start;
      this.args.mandataris.end = formValues.end;
    }
    this.isMandatarisVerhinderd = formValues.status.isVerhinderd;
  }

  @action
  selectReasonForChange(reason) {
    this.reasonForChange = reason;
  }
}
