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
      this.args.formValues.bekleedt
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
  @tracked replacementMandataris;
  @tracked replacementPerson;
  @tracked originalReplacementPerson;
  @tracked beleidsdomeinCodes = [];

  @tracked errorMap = new Map();

  @use(getStatusOptions) getStatusOptions;

  constructor() {
    super(...arguments);
    this.setInitialFormState();
    this.args.mandataris.beleidsdomein?.then((codes) => {
      this.initialBeleidsdomeinCodes = codes;
    });
  }

  @action
  async setInitialFormState() {
    this.startDate = this.args.formValues.start;
    this.endDate = this.args.formValues.einde;
    this.rangorde = this.args.formValues.rangorde;
    this.mandaat = await this.args.formValues.bekleedt;
    this.status = await this.args.formValues.status;
    this.fractie = await this.args.formValues.fractie;
    this.replacementMandataris =
      (await this.args.formValues.tijdelijkeVervangingen)?.[0] || null;
    this.replacementPerson =
      await this.replacementMandataris?.isBestuurlijkeAliasVan;
    this.beleidsdomeinCodes = (await this.args.formValues.beleidsdomein) || [];
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
      this.rangorde !== this.args.mandataris.rangorde ||
      this.args.originalReplacementPerson?.id !== this.replacementPerson?.id ||
      this.isBeleidsdomeinenChanged
    );
  }

  get disabled() {
    return !this.hasChanges || this.formHasErrors;
  }

  get toolTipText() {
    return 'Er zijn geen wijzigingen om op te slaan.';
  }

  get isStatusVerhinderd() {
    return this.status?.get('isVerhinderd');
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

  get isBeleidsdomeinenChanged() {
    if (
      this.initialBeleidsdomeinCodes?.length !== this.beleidsdomeinCodes.length
    ) {
      return true;
    }

    const initialIds =
      this.initialBeleidsdomeinCodes?.map((code) => code.id) || [];
    return (
      this.beleidsdomeinCodes?.filter((code) => !initialIds.includes(code.id))
        ?.length >= 1
    );
  }

  get hasReplacementError() {
    return this.errorMap.get('replacement');
  }

  get formHasErrors() {
    const errorArray = Array.from(this.errorMap.values());

    return errorArray.some((bool) => bool);
  }

  @action
  updateErrorMap({ id, hasErrors }) {
    this.errorMap.set(id, !!hasErrors);
    this.errorMap = new Map(this.errorMap);

    this.args.formValues.start = this.startDate;
    this.args.formValues.einde = this.endDate;
    this.args.formValues.status = this.status;
    this.args.formValues.rangorde = this.rangorde;
    this.args.formValues.fractie = this.fractie;
    this.args.formValues.beleidsdomein = this.beleidsdomeinCodes;

    if (this.replacementMandataris) {
      this.args.formValues.tijdelijkeVervangingen = [
        this.replacementMandataris,
      ];
    }

    this.args.onFormIsValid?.(!this.formHasErrors && !this.disabled, {
      mandataris: this.args.formValues,
      replacementPerson: this.replacementPerson,
      replacementMandataris: this.replacementMandataris,
    });
  }

  @action
  updateStatus(status) {
    this.status = status;
    this.updateErrorMap({ id: 'status', hasErrors: false });
    this.args.onChange({
      ...this.args.formValues,
      status: status,
    });
  }

  @action
  updateReplacement(person, overlappingMandate) {
    this.replacementPerson = person;
    this.replacementMandataris = overlappingMandate;
    this.updateErrorMap({
      id: 'replacement',
      hasErrors: person?.id === this.args.formValues.isBestuurlijkeAliasVan.id,
    });
    this.args.onChange({
      ...this.args.formValues,
    });
    this.args.onReplacementChange({
      replacementPerson: person,
      replacementMandataris: overlappingMandate,
    });
  }

  @action updateFractie(newFractie) {
    this.fractie = newFractie;
    this.updateErrorMap({ id: 'fractie', hasErrors: false });
    this.args.onChange({
      ...this.args.formValues,
      fractie: newFractie,
    });
  }

  @action
  updateStartEndDate(startDate, endDate) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.args.onChange({
      ...this.args.formValues,
      start: startDate,
      einde: endDate,
    });
  }

  @action
  updateRangorde(rangordeAsString) {
    this.rangorde = rangordeAsString;
    this.updateErrorMap({ id: 'rangorde', hasErrors: false });
    this.args.onChange({
      ...this.args.formValues,
      rangorde: rangordeAsString,
    });
  }

  @action
  updateBeleidsdomeinen(beleidsdomeinenCodes) {
    this.beleidsdomeinCodes = beleidsdomeinenCodes;
    this.updateErrorMap({ id: 'beleidsdomein', hasErrors: false });
    this.args.onChange({
      ...this.args.formValues,
      beleidsdomein: beleidsdomeinenCodes,
    });
  }

  get warningTextOCMWLinkToGemeente() {
    return `Let op! Deze mandataris heeft een gelinkte mandataris in de gemeente.
      Bij het aanpassen van deze gegevens wordt deze koppeling verbroken.
      Het doorstromen van gegevens van de gemeente naar OCMW zal
      hierdoor ook niet meer gebeuren. Om een wijziging aan beide mandaten te
      maken, gelieve dit te doen in de gemeente.`;
  }
}
