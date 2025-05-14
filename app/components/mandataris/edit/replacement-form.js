import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';

import { tracked } from '@glimmer/tracking';

import {
  isDisabledForBestuursorgaan,
  isRequiredForBestuursorgaan,
} from 'frontend-lmb/utils/is-fractie-selector-required';

export default class MandatarisEditReplacementForm extends Component {
  @service store;
  @service('mandataris') mandatarisService;

  @tracked person;
  @tracked startDate;
  @tracked endDate;
  @tracked fractie;

  @tracked overlappingMandate;
  @tracked hasReplacementError;
  @tracked errorMap = new Map();

  constructor() {
    super(...arguments);
    this.startDate = this.args.startDate;
  }

  get showExtraFields() {
    return this.person && !this.overlappingMandate;
  }

  get isFractieRequired() {
    return isRequiredForBestuursorgaan(this.args.bestuursorgaanIT);
  }

  get hideFractieField() {
    return isDisabledForBestuursorgaan(this.args.bestuursorgaanIT);
  }

  @action
  async selectPerson(person, overlap) {
    if (person?.id === this.args.mandataris.isBestuurlijkeAliasVan.id) {
      this.hasReplacementError = true;
    } else {
      this.hasReplacementError = false;
    }
    this.person = person;
    this.overlappingMandate = overlap;
  }

  @action
  selectFractie(fractie) {
    this.fractie = fractie;
    this.updateErrorMap({ id: 'fractie', hasErrors: !fractie });
  }

  @action
  updateStartEndDate(startDate, endDate) {
    this.startDate = startDate;
    this.endDate = endDate;
  }

  get formHasErrors() {
    const errorArray = Array.from(this.errorMap.values());

    return errorArray.some((bool) => bool);
  }

  @action
  async updateErrorMap({ id, hasErrors }) {
    this.errorMap.set(id, !!hasErrors);
    this.errorMap = new Map(this.errorMap);
    this.args.onFormIsValid?.(!this.formHasErrors, {
      person: this.person,
      replacementProps: {
        start: this.startDate,
        einde: this.endDate,
        fractie: this.fractie,
        rangorde: null,
      },
    });
  }
}
