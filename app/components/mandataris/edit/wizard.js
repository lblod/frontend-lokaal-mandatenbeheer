import Component from '@glimmer/component';

import { action, get } from '@ember/object';
import moment from 'moment';
import { service } from '@ember/service';

import { tracked } from '@glimmer/tracking';

import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';
import { endOfDay } from 'frontend-lmb/utils/date-manipulation';
import { getNietBekrachtigdPublicationStatus } from 'frontend-lmb/utils/get-mandataris-status';
import { timeout } from 'ember-concurrency';

const UPDATE_STATE = 'update state';
const CORRECT_MISTAKES = 'corrigeer fouten';

const fieldsToDiff = [
  { label: 'Status', path: 'status.label' },
  {
    label: 'Fractie',
    path: 'heeftLidmaatschap.binnenFractie.naam',
    formValuesPath: 'fractie.naam',
  },
  { label: 'Rangorde', path: 'rangorde' },
  { label: 'Start', path: 'start', correctingOnly: true, date: true },
  { label: 'Einde', path: 'einde', correctingOnly: true, date: true },
];

export default class MandatarisEditWizard extends Component {
  @service toaster;
  @service router;
  @service store;
  @service('mandataris') mandatarisService;
  @service fractieApi;
  @service currentSession;
  @service mandatarisApi;

  @tracked activeStepIndex = 0;
  @tracked isMandatarisVerhinderd;
  @tracked isSaving;
  @tracked formValues;
  @tracked loading = true;

  @tracked isUnsavedChangesModalOpen;
  @tracked isRangordeModalOpen;
  @tracked isMandatarisStepCompleted;
  @tracked isReplacementStepCompleted;
  @tracked isUpdateState;
  @tracked correctedMandataris;
  @tracked isReplacementAdded;
  @tracked mirrorToOCMW = false;
  @tracked canMirrorToOCMW = false;
  @tracked mandatarisHasDouble = undefined;

  @tracked reasonForChangeOptions = [
    { label: 'Update state', type: UPDATE_STATE },
    { label: 'Corrigeer fouten', type: CORRECT_MISTAKES },
  ];
  @tracked reasonForChange;
  @tracked replacementPerson;
  @tracked replacementMandataris;
  @tracked replacementProps;
  @tracked newMandataris;
  @tracked originalReplacementPerson;
  @tracked startForReplacement;
  @tracked endForReplacement;
  @tracked fractieForReplacement;

  constructor() {
    super(...arguments);
    this.formValues = this.args.mandatarisFormValues || {};
    setTimeout(async () => {
      const originalReplacement = (
        await this.args.mandataris.tijdelijkeVervangingen
      )?.[0];
      const person = await originalReplacement?.isBestuurlijkeAliasVan;
      this.replacementPerson = person;
      this.originalReplacementPerson = person;
      this.loading = false;
    });
  }

  get mandatarisTitle() {
    return `Bewerk ${this.args.mandataris.bekleedt.get('bestuursfunctie').get('label')} - ${this.args.mandataris.isBestuurlijkeAliasVan.get('naam')}`;
  }

  get replacementTitle() {
    return this.replacementPerson
      ? `Gegevens voor ${this.replacementPerson.naam} (waarnemend), vervanger van ${this.args.mandataris.isBestuurlijkeAliasVan.get('naam')}`
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
          this.originalReplacementPerson != this.replacementPerson &&
          !this.replacementMandataris,
        canContinueToNextStep: this.isReplacementStepCompleted,
      },
      {
        label: 'Bevestigen van aanpassing',
        isReasonStep: true,
        isStepShown: true,
        canContinueToNextStep: this.reasonForChange,
      },
    ];
  }

  get activeStep() {
    if (this.loading) {
      return null;
    }
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

  get isCorrecting() {
    return this.reasonForChange?.type === CORRECT_MISTAKES;
  }

  get hideCorrectionWarning() {
    return this.reasonForChange.softCorrection;
  }

  get isReplacementSameAsOrginal() {
    return this.replacementPerson === this.originalReplacementPerson;
  }

  async updateReasonOptions() {
    const newReasons = [];
    let onlyCorrectionAllowed = false;
    const mandatarisStatus = await this.args.mandataris.status;
    const fractie = await this.args.mandataris.get(
      'heeftLidmaatschap.binnenFractie'
    );
    const newStatus = await this.formValues.status;

    if (newStatus.isBeeindigd) {
      newReasons.push({
        label: 'Het mandaat wordt beëindigd',
        type: CORRECT_MISTAKES,
      });
      this.reasonForChangeOptions = newReasons;
      this.reasonForChange = newReasons[0];
      return;
    }
    if (this.formValues.fractie != fractie) {
      const availableFracties = await this.mandatarisApi.getMandatarisFracties(
        this.args.mandataris.id
      );
      if (
        fractie?.isOnafhankelijk &&
        availableFracties.find((f) => f.id == this.formValues.fractie?.id)
      ) {
        newReasons.push({
          label: 'keert terug naar de oorspronkelijke fractie',
          type: UPDATE_STATE,
        });
      } else if (this.formValues.fractie?.isOnafhankelijk) {
        newReasons.push({
          label: 'gaat verder als onafhankelijke',
          type: UPDATE_STATE,
        });
      } else {
        // in this case, they changed the fraction to something different from before.
        // This is only allowed if they do a correction and we should therefore only give
        // them this option
        onlyCorrectionAllowed = true;
      }
    }

    if (this.formValues.rangorde != this.args.mandataris.rangorde) {
      newReasons.push({
        label: 'verandert van rangorde',
        type: UPDATE_STATE,
      });
    }
    if (newStatus.isVerhinderd && !mandatarisStatus?.isVerhinderd) {
      newReasons.push({
        label: 'raakt verhinderd',
        type: UPDATE_STATE,
      });
    }
    if (mandatarisStatus.isVerhinderd && newStatus?.isEffectief) {
      newReasons.push({
        label: `is niet langer verhinderd en neemt het mandaat terug op`,
        type: UPDATE_STATE,
      });
    }
    const changedLabels = this.wizardDiffs.map((diff) => {
      return diff.field.toLowerCase();
    });
    const changedText = this.joinStringWithCommaAndFinalAnd(changedLabels);

    const was = changedLabels.length == 1 ? 'was' : 'waren';
    const wordt = changedLabels.length == 1 ? 'wordt' : 'worden';
    const correctionReason = {
      label: `De ${changedText} van de mandataris ${was} verkeerd ingevuld en ${wordt} gecorrigeerd`,
      type: CORRECT_MISTAKES,
    };

    const mergedUpdateStateReasonTexts = newReasons
      .filter((reason) => {
        // this filter should already be ok, but it's probably best to be sure
        return reason.type === UPDATE_STATE;
      })
      .map((reason) => {
        return reason.label;
      });
    const updateReasonText = this.joinStringWithCommaAndFinalAnd(
      mergedUpdateStateReasonTexts
    );
    if (onlyCorrectionAllowed || mergedUpdateStateReasonTexts.length === 0) {
      if (
        this.wizardDiffs.length === 1 &&
        this.wizardDiffs[0].field === 'Vervanger'
      ) {
        // if the only change is the replacement, we should not use the generic text
        // because it feels too scary to users
        correctionReason.label = `De vervanger van de mandataris wordt aangepast`;
        correctionReason.softCorrection = true;
      }

      this.reasonForChangeOptions = [correctionReason];
      this.reasonForChange = null; // force user to select a reason and think about it
      return;
    }

    this.reasonForChangeOptions = [
      {
        label: `De mandataris ${updateReasonText}`,
        type: UPDATE_STATE,
      },
      correctionReason,
    ];
    this.reasonForChange = null; // force user to select a reason and think about it
  }

  joinStringWithCommaAndFinalAnd(string) {
    if (!string || string.length === 0) {
      return '';
    }
    if (string.length === 1) {
      return string[0];
    }
    const head = string.slice(0, -1).join(', ');
    const tail = string.slice(-1);
    return `${head} en ${tail}`;
  }

  async checkIfCanMirrorToOCMW() {
    const mandaatCanMirror = (
      await this.args.mandataris.get('bekleedt.bestuursfunctie')
    ).canMirrorToOCMW;
    if (!mandaatCanMirror) {
      this.canMirrorToOCMW = false;
      return;
    }
    if (this.mandatarisHasDouble === undefined) {
      const response = await fetch(
        `/mandataris-api/mandatarissen/${this.args.mandataris.id}/check-possible-double`
      );
      const jsonResponse = await response.json();
      this.mandatarisHasDouble = jsonResponse.hasDouble;
    }
    if (this.mandatarisHasDouble) {
      this.canMirrorToOCMW = true;
      this.mirrorToOCMW = !this.currentSession.group.isFaciliteitenGemeente;
    } else {
      this.canMirrorToOCMW = false;
    }
  }

  async checkMandatarisInput() {
    this.checkingMandatarisInput = true;
    await timeout(300); // give date inputs time to update values

    await this.checkIfCanMirrorToOCMW();
    await this.updateReasonOptions();

    this.checkingMandatarisInput = false;

    this.startForReplacement =
      this.startForReplacement || this.formValues?.start || new Date();
    this.endForReplacement = this.endForReplacement || this.formValues?.einde;

    return this.activeStep.canContinueToNextStep;
  }

  @action
  async nextStep() {
    const canContinue = await this.checkMandatarisInput();
    if (!canContinue) {
      return null;
    }
    let nextStepIndex = this.activeStepIndex + 1;
    if (this.activeStepIsFinalStep) {
      return null;
    }
    while (
      this.steps[nextStepIndex] &&
      !this.steps[nextStepIndex].isStepShown
    ) {
      nextStepIndex++;
    }
    this.activeStepIndex = nextStepIndex;

    return this.steps[nextStepIndex];
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
    this.isUnsavedChangesModalOpen = false;
    this.activeStepIndex = 0;
    this.isMandatarisStepCompleted = false;
    this.isReplacementStepCompleted = false;
    this.reasonForChange = null;
  }

  @action
  async updateMandatarisStepCompleted(isCompleted) {
    this.isMandatarisStepCompleted = isCompleted;
    this.isMandatarisVerhinderd = (
      await this.args.mandatarisFormValues.status
    ).isVerhinderd;
  }

  @action
  updateReplacementStepValid(valid) {
    this.isReplacementStepCompleted = valid;
  }

  @action
  updateReplacementFormValues(replacementProps) {
    this.replacementProps = replacementProps;
    this.startForReplacement = replacementProps.start;
    this.endForReplacement = replacementProps.einde;
    this.fractieForReplacement = replacementProps.fractie;
  }

  @action
  selectReasonForChange(reason) {
    this.reasonForChange = reason;
  }

  @action
  async saveChanges() {
    this.isSaving = true;
    if (this.reasonForChange.type == CORRECT_MISTAKES) {
      await this.corrigeerFouten();
    } else if (this.reasonForChange.type == UPDATE_STATE) {
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
      const replacement = await this.handleReplacement(this.args.mandataris);

      this.args.mandataris.status = await this.formValues.status;
      this.args.mandataris.start = this.formValues.start;
      this.args.mandataris.einde = this.formValues.einde;
      this.args.mandataris.rangorde = this.formValues.rangorde;
      this.args.mandataris.beleidsdomein = this.formValues.beleidsdomein ?? [];
      if (!this.isReplacementSameAsOrginal) {
        this.args.mandataris.tijdelijkeVervangingen = replacement
          ? [replacement]
          : [];
      }
      await this.args.mandataris.save();
      await this.handleFractie(this.args.mandataris, this.formValues.fractie);
      this.isReplacementAdded = this.replacementPerson;
      this.correctedMandataris = true;

      let message = 'De mandataris werd succesvol aangepast.';

      if (this.mirrorToOCMW) {
        const response = await fetch(
          `/mandataris-api/mandatarissen/${this.args.mandataris.id}/correct-linked-mandataris`,
          { method: 'POST' }
        );
        if (response.ok) {
          message =
            'De mandataris werd succesvol aangepast en gespiegeld in het OCMW.';
        } else {
          showErrorToast(
            this.toaster,
            'Er ging iets mis bij het aanpassen van het corresponderend mandaat in het OCMW.'
          );
        }
      }
      this.router.refresh();
      showSuccessToast(this.toaster, message);
    } catch (error) {
      showErrorToast(
        this.toaster,
        'Er ging iets mis bij het aanpassen van het mandaat.'
      );
    }
  }

  async updateState() {
    let promise;
    if ((await this.formValues.status).isBeeindigd) {
      promise = this.endMandataris();
    } else {
      promise = this.changeMandatarisState();
    }

    let message = 'De status van het mandaat werd succesvol aangepast.';
    if (this.mirrorToOCMW) {
      message =
        'De status van het mandaat werd succesvol aangepast en het corresponderend mandaat in het OCMW werd aangepast.';
    }

    await promise
      .then(async (newMandataris) => {
        showSuccessToast(this.toaster, message);
        this.newMandataris = newMandataris;
        this.isReplacementAdded = this.replacementPerson;
        this.isUpdateState = true;
        this.args.onFinish(this.args.mandataris, this.newMandataris);
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
    let message = 'Het mandaat werd succesvol beëindigd.';
    await this.args.mandataris.save();

    if (this.mirrorToOCMW) {
      const response = await fetch(
        `/mandataris-api/mandatarissen/${this.args.mandataris}/${this.args.newMandataris}/update-state-linked-mandataris`,
        { method: 'POST' }
      );
      if (response.ok) {
        message =
          'Het mandaat werd succesvol beëindigd en het corresponderend mandaat in het OCMW werd aangepast.';
      } else {
        showErrorToast(
          this.toaster,
          'Er ging iets mis bij het aanpassen van het corresponderend mandaat in het OCMW.'
        );
      }
    }
    showSuccessToast(this.toaster, message);
    return this.args.mandataris;
  }

  async changeMandatarisState() {
    const newMandatarisProps = await this.mandatarisService.createNewProps(
      this.args.mandataris,
      {
        start: this.formValues.start,
        einde: this.formValues.einde,
        status: await this.formValues.status,
        publicationStatus: await getNietBekrachtigdPublicationStatus(
          this.store
        ),
        beleidsdomein: this.formValues.beleidsdomein ?? [],
      }
    );

    const newMandataris = this.store.createRecord('mandataris', {
      ...newMandatarisProps,
      rangorde: this.formValues.rangorde,
    });

    const replacement = await this.handleReplacement(newMandataris);

    this.args.mandataris.einde = endOfDay(this.formValues.start);
    if (replacement) {
      newMandataris.tijdelijkeVervangingen = [replacement];
    }
    await Promise.all([newMandataris.save(), this.args.mandataris.save()]);

    await this.handleFractie(newMandataris, this.formValues.fractie);

    if (this.mirrorToOCMW) {
      const response = await fetch(
        `/mandataris-api/mandatarissen/${this.args.mandataris.id}/${newMandataris.id}/update-state-linked-mandataris`,
        { method: 'POST' }
      );
      if (!response.ok) {
        showErrorToast(
          this.toaster,
          'Er ging iets mis bij het aanpassen van het corresponderend mandaat in het OCMW.'
        );
      }
    }

    return newMandataris;
  }

  async handleReplacement(replacedMandataris) {
    if (!this.replacementMandataris && !this.replacementPerson) {
      return null; // No replacement selected
    }
    if (this.isReplacementSameAsOrginal) {
      const originalReplacementMandataris = (
        await this.args.mandataris.tijdelijkeVervangingen
      )[0];

      return originalReplacementMandataris;
    }

    let replacer = null;
    if (this.replacementMandataris) {
      // the replacement mandataris was already chosen from a list of pre-existing mandatarissen. We can just connect to the existing one
      if (this.mirrorToOCMW) {
        const response = await fetch(
          `/mandataris-api/mandatarissen/${this.replacementMandataris.id}/check-possible-double`
        );
        const jsonResponse = await response.json();
        const isAvailableInOCMW = jsonResponse.hasDouble;
        if (!isAvailableInOCMW) {
          const createReplacementDoubleResponse = await fetch(
            `/mandataris-api/mandatarissen/${this.replacementMandataris.id}/create-linked-mandataris`,
            { method: 'POST' }
          );
          if (!createReplacementDoubleResponse.ok) {
            throw new Error(
              'Er ging iets mis bij het aanmaken van de vervanger in het OCMW.'
            );
          }
        }
      }
      replacer = this.replacementMandataris;
    } else if (this.replacementPerson) {
      // we need to have a replacement created for the selected person
      replacer = await this.mandatarisService.createReplacement(
        this.args.mandataris,
        this.replacementPerson,
        this.replacementProps
      );
      await this.handleFractie(replacer, this.replacementProps.fractie);
      if (this.mirrorToOCMW) {
        const createReplacementDoubleResponse = await fetch(
          `/mandataris-api/mandatarissen/${replacer.id}/create-linked-mandataris`,
          { method: 'POST' }
        );
        if (!createReplacementDoubleResponse.ok) {
          throw new Error(
            'Er ging iets mis bij het aanmaken van de vervanger in het OCMW.'
          );
        }
      }
    }

    replacer.tijdelijkeVervangingen = [replacedMandataris];
    return replacer;
  }

  async handleFractie(mandataris, fractie) {
    if (
      mandataris.heeftLidmaatschap?.get('binnenFractie')?.get('uri') ===
      fractie?.uri
    ) {
      return;
    }
    await this.mandatarisService.createNewLidmaatschap(mandataris, fractie);
    await this.fractieApi.updateCurrentFractie(mandataris.id, true);
    await this.mandatarisService.removeDanglingFractiesInPeriod(
      mandataris.id,
      true
    );
  }

  get wizardDiffs() {
    if (!this.args.mandataris) {
      return [];
    }
    const fieldDiffs = fieldsToDiff
      .map((field) => {
        let old = this.args.mandataris.get(field.path);
        let current = get(this.formValues, field.formValuesPath || field.path);
        if (field.date) {
          old = old ? moment(old).format('DD-MM-YYYY') : null;
          current = current ? moment(current).format('DD-MM-YYYY') : null;
        }
        if (old != current) {
          return {
            field: field.label,
            correctingOnly: field.correctingOnly,
            old,
            current,
          };
        }
      })
      .filter((diff) => !!diff);

    const oldReplacement = this.originalReplacementPerson;
    const newReplacement = this.replacementPerson;
    if (oldReplacement != newReplacement) {
      fieldDiffs.push({
        field: 'Vervanger',
        old: oldReplacement ? oldReplacement.naam : null,
        current: newReplacement ? newReplacement.naam : null,
      });
    }
    return fieldDiffs;
  }

  get getShownWizardDiffs() {
    const shown = this.wizardDiffs.filter((field) => {
      return !field.correctingOnly || this.isCorrecting;
    });
    if (shown.length === 0) {
      return this.wizardDiffs;
    } else {
      return shown;
    }
  }

  get newStateDateWarning() {
    return moment(this.args.mandataris.start).isSameOrAfter(
      this.formValues.start,
      'day'
    );
  }

  get replacementLimitTo() {
    return this.formValues.einde || this.args.bestuursorgaanIT.bindingEinde;
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

  @action
  updateMandatarisFormValues(newFormValues) {
    this.formValues = newFormValues;
  }

  @action
  updateReplacement({ replacementPerson, replacementMandataris }) {
    this.replacementPerson = replacementPerson;
    this.replacementMandataris = replacementMandataris;
  }

  @action
  toggleMirrorToOCMW() {
    this.mirrorToOCMW = !this.mirrorToOCMW;
  }
}
