import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import { MANDATARIS_VERHINDERD_STATE } from 'frontend-lmb/utils/well-known-uris';
import { isDisabledForBestuursorgaan } from 'frontend-lmb/utils/is-fractie-selector-required';

import moment from 'moment';
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
  @service mandatarisStatus;

  @tracked mandaat;
  @tracked status;
  @tracked startDate;
  @tracked endDate;
  @tracked fractie;
  @tracked rangorde;
  @tracked person;

  @tracked errorMap = new Map();

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
    this.person = await this.args.mandataris.isBestuurlijkeAliasVan;
  }

  get statusOptions() {
    return this.getStatusOptions?.value ?? [];
  }

  get hasChanges() {
    return (
      this.status?.id !== this.args.mandataris.status?.id ||
      !moment(this.startDate).isSame(moment(this.args.mandataris.start)) ||
      !moment(this.endDate).isSame(moment(this.args.mandataris.einde)) ||
      this.fractie?.id !==
        this.args.mandataris.get('heeftLidmaatschap.binnenFractie.id') ||
      this.rangorde !== this.args.mandataris.rangorde
    );
  }

  get disabled() {
    return !this.hasChanges || this.formHasErrors;
  }

  get toolTipText() {
    return 'Er zijn geen wijzigingen om op te slaan.';
  }

  get isStatusVerhinderd() {
    return (
      this.status?.get('isVerhinderd') &&
      !this.args.mandataris.status.get('isVerhinderd')
    );
  }

  get isTerminatingMandate() {
    return this.status?.get('isBeeindigd');
  }

  get showRangordeField() {
    return (
      this.mandaat?.get('hasRangorde') &&
      this.status?.get('uri') !== MANDATARIS_VERHINDERD_STATE
    );
  }

  get hideFractieField() {
    return isDisabledForBestuursorgaan(this.args.bestuursorgaanIT);
  }

  get mandaatLabel() {
    return this.mandaat.rangordeLabel;
  }

  get rangordePlaceholder() {
    return `Eerste ${this.mandaatLabel}`;
  }

  get formHasErrors() {
    const errorArray = Array.from(this.errorMap.values());

    return errorArray.some((bool) => bool);
  }

  @action
  updateErrorMap({ id, hasErrors }) {
    this.errorMap.set(id, !!hasErrors);
    this.errorMap = new Map(this.errorMap);

    this.args.onFormIsValid?.(
      !this.formHasErrors && !this.disabled && this.hasChanges,
      {
        status: this.status,
        rangorde: this.rangorde,
        fractie: this.fractie,
        start: this.startDate,
        einde: this.endDate,
      }
    );
  }

  @action
  updateStatus(status) {
    this.status = status;
    this.updateErrorMap({ id: 'status', hasErrors: false });
  }

  @action
  updateReplacement(newReplacement) {
    this.replacement = newReplacement;
    this.updateErrorMap({
      id: 'replacement',
      hasErrors:
        newReplacement?.id === this.args.mandataris.isBestuurlijkeAliasVan.id,
    });
  }

  @action updateFractie(newFractie) {
    this.fractie = newFractie;
    this.updateErrorMap({ id: 'fractie', hasErrors: false });
  }

  @action
  updateStartEndDate(startDate, endDate) {
    this.startDate = startDate;
    this.endDate = endDate;
  }

  @action
  updateRangorde(rangordeAsString) {
    this.rangorde = rangordeAsString;
    this.updateErrorMap({ id: 'rangorde', hasErrors: false });
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
}
