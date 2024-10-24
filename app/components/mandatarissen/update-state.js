import Component from '@glimmer/component';

import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import moment from 'moment';

import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';
import { getDraftPublicationStatus } from 'frontend-lmb/utils/get-mandataris-status';
import {
  MANDATARIS_TITELVOEREND_STATE,
  MANDATARIS_VERHINDERD_STATE,
  burgemeesterOnlyStates,
  notBurgemeesterStates,
} from 'frontend-lmb/utils/well-known-uris';
import { isDateInRange } from '../date-input';
import { isRequiredForBestuursorgaan } from 'frontend-lmb/utils/is-fractie-selector-required';

export default class MandatarissenUpdateState extends Component {
  @tracked newStatus = null;
  @tracked date = null;
  @tracked selectedFractie = null;
  @tracked bestuurseenheid = null;
  @tracked bestuursorganenOfMandaat = [];
  @tracked bestuursperiode;
  @tracked bestuursorgaanStartDate;
  @tracked bestuursorgaanEndDate;
  @tracked rangorde = null;
  @tracked selectedReplacement = null;
  @tracked inValidReplacement = false;
  @tracked replacementUpdated;
  @tracked statusOptions = [];
  @tracked isFractieSelectorRequired;

  @service mandatarisStatus;
  @service currentSession;
  @service store;
  @service toaster;
  @service('mandataris') mandatarisService;
  @service fractieApi;
  @service mandatarisApi;

  currentBestuursorgaan;

  constructor() {
    super(...arguments);
    this.bestuurseenheid = this.currentSession.group;
    this.load.perform();
  }

  load = task({ drop: true }, async () => {
    this.newStatus = this.args.mandataris.status;
    this.date = new Date();
    this.rangorde = this.args.mandataris.rangorde;
    this.selectedFractie = await (
      await this.args.mandataris.heeftLidmaatschap
    )?.binnenFractie;
    this.bestuursorganenOfMandaat = (
      await (
        await this.args.mandataris.bekleedt
      ).bevatIn
    ).slice();
    this.bestuursperiode =
      await this.bestuursorganenOfMandaat[0]?.heeftBestuursperiode;
    this.statusOptions = await this.getStatusOptions();
    await this.getBestuursorgaanPeriod();
    this.isFractieSelectorRequired = await isRequiredForBestuursorgaan(
      this.currentBestuursorgaan
    );
  });

  async getBestuursorgaanPeriod() {
    const mandaat = await this.args.mandataris.bekleedt;
    const bestuursorganen = await mandaat.bevatIn;
    if (bestuursorganen.length >= 1) {
      this.currentBestuursorgaan = bestuursorganen.at(0);
      this.bestuursorgaanStartDate = this.currentBestuursorgaan.bindingStart;
      this.bestuursorgaanEndDate = this.currentBestuursorgaan.bindingEinde;
    }
  }

  async getStatusOptions() {
    const isBurgemeester = (
      await (
        await this.args.mandataris.bekleedt
      ).bestuursfunctie
    ).isBurgemeester;

    // Slice to get rid of proxy
    const statuses = this.mandatarisStatus.statuses.slice();

    if (isBurgemeester) {
      return statuses.filter(
        (status) => !notBurgemeesterStates.includes(status.uri)
      );
    }
    return statuses.filter(
      (status) => !burgemeesterOnlyStates.includes(status.uri)
    );
  }

  get currentStatus() {
    if (!this.args.mandataris.einde) {
      return this.args.mandataris.status;
    }
    if (this.args.mandataris.einde.getTime() < new Date().getTime()) {
      return this.mandatarisStatus.endedState;
    }
    return this.args.mandataris.status;
  }

  get showReplacement() {
    return (
      (this.newStatus?.get('uri') === MANDATARIS_VERHINDERD_STATE ||
        this.newStatus?.get('uri') === MANDATARIS_TITELVOEREND_STATE) &&
      // if we are already verhinderd it does not make sense to change the replacements here, keep them  the same and don't show the selector
      this.args.mandataris.status?.get('uri') !== MANDATARIS_VERHINDERD_STATE &&
      this.args.mandataris.status?.get('uri') !== MANDATARIS_TITELVOEREND_STATE
    );
  }

  get isTerminatingMandate() {
    return this.newStatus === this.mandatarisStatus.endedState;
  }

  get isInputDateTheSameAsMandatarisStart() {
    const startDate = new Date();
    const inputDate = new Date(this.date);
    return moment(startDate).isSame(moment(inputDate), 'day');
  }

  get hasChanges() {
    return (
      !this.isInputDateTheSameAsMandatarisStart ||
      // ended state is always a new state because if ended, you can't used change state
      this.newStatus === this.mandatarisStatus.endedState ||
      this.newStatus?.id !== this.args.mandataris.status?.id ||
      this.selectedFractie?.id !==
        this.args.mandataris.get('heeftLidmaatschap.binnenFractie.id') ||
      this.rangorde !== this.args.mandataris.rangorde ||
      this.replacementUpdated
    );
  }

  get disabled() {
    return (
      this.load.isRunning ||
      !this.newStatus ||
      !this.date ||
      this.inValidReplacement ||
      !this.hasChanges ||
      (this.isFractieSelectorRequired && !this.selectedFractie) ||
      !isDateInRange(
        this.date,
        this.bestuursorgaanStartDate,
        this.bestuursorgaanEndDate
      )
    );
  }

  get rangordePlaceholder() {
    const mandaatName = (
      this.args.mandataris.get('bekleedt.bestuursfunctie.label') || 'schepen'
    ).toLowerCase();
    return `Eerste ${mandaatName}`;
  }

  async changeMandatarisState() {
    const endDate = this.args.mandataris.einde;

    const newMandatarisProps = await this.mandatarisService.createNewProps(
      this.args.mandataris,
      {
        rangorde: this.rangorde,
        start: this.date,
        einde: endDate,
        status: this.newStatus,
        publicationStatus: await getDraftPublicationStatus(this.store),
      }
    );

    const newMandataris = this.store.createRecord(
      'mandataris',
      newMandatarisProps
    );

    if (this.selectedReplacement) {
      const replacementMandataris =
        await this.mandatarisService.getOrCreateReplacement(
          this.args.mandataris,
          this.selectedReplacement,
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

    this.args.mandataris.einde = this.date;
    await Promise.all([newMandataris.save(), this.args.mandataris.save()]);

    await this.mandatarisService.createNewLidmaatschap(
      newMandataris,
      this.selectedFractie
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

  async endMandataris() {
    this.args.mandataris.einde = this.date;

    return await this.args.mandataris.save();
  }

  onStateChanged(newMandataris) {
    if (this.args.onStateChanged) {
      this.args.onStateChanged(newMandataris);
    }
  }

  updateState = task({ drop: true }, async () => {
    let promise;
    if (this.newStatus === this.mandatarisStatus.endedState) {
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
        this.onStateChanged(newMandataris);
      })
      .catch((e) => {
        console.log(e);
        showErrorToast(
          this.toaster,
          'Er ging iets mis bij het aanpassen van de status van het mandaat.'
        );
        this.onStateChanged(this.args.mandataris);
      });
  });

  @action
  updateDate(date) {
    this.date = new Date(date);
  }

  @action
  updateNewStatus(status) {
    this.newStatus = status;
  }

  @action
  updateRangorde(event) {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    this.rangorde = event.target.value;
  }

  @action updateFractie(newFractie) {
    this.selectedFractie = newFractie;
  }

  @action updateReplacement(newReplacement) {
    if (this.args.mandataris.isBestuurlijkeAliasVan.id === newReplacement?.id) {
      this.inValidReplacement = true;
    } else {
      this.inValidReplacement = false;
    }
    this.selectedReplacement = newReplacement;
    this.replacementUpdated = true;
  }

  get toolTipText() {
    return 'Er zijn geen wijzigingen om op te slaan.';
  }
}
