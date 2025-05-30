import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';

import { tracked } from '@glimmer/tracking';

import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';
import { endOfDay } from 'frontend-lmb/utils/date-manipulation';
import { getNietBekrachtigdPublicationStatus } from 'frontend-lmb/utils/get-mandataris-status';
import { MANDATARIS_VERHINDERD_STATE } from 'frontend-lmb/utils/well-known-uris';
import { timeout } from 'ember-concurrency';

const UPDATE_STATE = 'update state';
const CORRECT_MISTAKES = 'corrigeer fouten';

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
  @tracked formValues;

  @tracked isUnsavedChangesModalOpen;
  @tracked isRangordeModalOpen;
  @tracked isMandatarisStepCompleted;
  @tracked isReplacementStepCompleted;
  @tracked isUpdateState;
  @tracked correctedMandataris;
  @tracked isReplacementAdded;

  @tracked reasonForChangeOptions = [
    { label: 'Update state', type: UPDATE_STATE },
    { label: 'Corrigeer fouten', type: CORRECT_MISTAKES },
  ];
  @tracked reasonForChange;
  @tracked replacementPerson;
  @tracked replacementMandataris;
  @tracked replacementProps;
  @tracked newMandataris;

  constructor() {
    super(...arguments);
    this.formValues = this.args.mandatarisFormValues || {};
  }

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
    return this.formValues?.start;
  }

  get eindeForReplacement() {
    return this.formValues?.einde;
  }

  get isCorrecting() {
    return this.reasonForChange?.type === CORRECT_MISTAKES;
  }

  async updateReasonOptions() {
    const newReasons = [];
    const mandatarisStatus = await this.args.mandataris.status;
    const fractie = await this.args.mandataris.get(
      'heeftLidmaatschap.binnenFractie'
    );
    if (this.formValues.status.isVerhinderd && !mandatarisStatus.isVerhinderd) {
      newReasons.push({
        label: 'De status van de mandataris is veranderd naar verhinderd',
        type: UPDATE_STATE,
      });
    }
    if (this.formValues.fractie != fractie && fractie.isOnafhankelijk) {
      const availableFracties = await this.mandatarisApi.getMandatarisFracties(
        this.args.mandataris.id
      );
      if (availableFracties.find((f) => f.id == this.formValues.fractie.id)) {
        newReasons.push({
          label: 'De mandataris keert terug naar de oorspronkelijke fractie',
          type: UPDATE_STATE,
        });
      }
    }
    if (
      this.formValues.fractie != fractie &&
      this.formValues.fractie.isOnafhankelijk
    ) {
      newReasons.push({
        label: 'De mandataris gaat verder als onafhankelijke',
        type: UPDATE_STATE,
      });
    }
    if (this.formValues.rangorde != this.args.mandataris.rangorde) {
      newReasons.push({
        label: 'De mandataris verandert van rangorde',
        type: UPDATE_STATE,
      });
    }
    if (this.formValues.status.isBeeindigd) {
      newReasons.push({
        label: 'Het mandaat wordt beëindigd',
        type: CORRECT_MISTAKES,
      });
    } else {
      newReasons.push({
        label: 'Correctie van verkeerde gegevens over de mandataris',
        type: CORRECT_MISTAKES,
      });
    }
    this.reasonForChangeOptions = newReasons;
    this.reasonForChange = newReasons[0];
  }

  async checkMandatarisInput() {
    this.checkingMandatarisInput = true;
    await timeout(300); // give date inputs time to update values

    await this.updateReasonOptions();
    this.checkingMandatarisInput = false;
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
      this.args.mandataris.status = await this.formValues.status;
      this.args.mandataris.start = this.formValues.start;
      this.args.mandataris.einde = this.formValues.einde;
      this.args.mandataris.rangorde = this.formValues.rangorde;
      this.args.mandataris.tijdelijkeVervangingen = this.replacementMandataris
        ? [this.replacementMandataris]
        : [];

      await this.args.mandataris.save();
      await this.handleFractie(this.args.mandataris, this.formValues.fractie);
      this.isReplacementAdded = this.replacementPerson;
      this.correctedMandataris = true;
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
    if ((await this.formValues.status).isBeeindigd) {
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
        start: this.formValues.start,
        einde: this.formValues.einde,
        status: await this.formValues.status,
        publicationStatus: await getNietBekrachtigdPublicationStatus(
          this.store
        ),
      }
    );

    const newMandataris = this.store.createRecord('mandataris', {
      ...newMandatarisProps,
      rangorde: this.formValues.rangorde,
    });

    await this.handleReplacement(newMandataris);

    this.args.mandataris.einde = endOfDay(this.formValues.start);
    await Promise.all([newMandataris.save(), this.args.mandataris.save()]);

    await this.handleFractie(newMandataris, this.formValues.fractie);

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

  @action
  updateMandatarisFormValues(newFormValues) {
    this.formValues = newFormValues;
  }
}
