import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import {
  isDisabledForBestuursorgaan,
  isRequiredForBestuursorgaan,
} from 'frontend-lmb/utils/is-fractie-selector-required';

export default class MandatarisEditReplacementForm extends Component {
  @tracked startDate;
  @tracked endDate;
  @tracked fractie;

  @tracked errorMap = new Map();

  constructor() {
    super(...arguments);
    this.startDate = this.args.prefillStart;
    this.endDate = this.args.prefillEinde;
    this.fractie = this.args.prefillFractie;
  }

  get isFractieRequired() {
    return isRequiredForBestuursorgaan(this.args.bestuursorgaanIT);
  }

  get hideFractieField() {
    return isDisabledForBestuursorgaan(this.args.bestuursorgaanIT);
  }

  @action
  selectFractie(fractie) {
    this.fractie = fractie;
    this.updateErrorMap({ id: 'fractie', hasErrors: !fractie });
    this.args.onChange({
      start: this.startDate,
      einde: this.endDate,
      fractie: this.fractie,
      rangorde: null,
    });
  }

  @action
  updateStartEndDate(startDate, endDate) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.args.onChange({
      start: this.startDate,
      einde: this.endDate,
      fractie: this.fractie,
      rangorde: null,
    });
  }

  get formHasErrors() {
    const errorArray = Array.from(this.errorMap.values());

    return errorArray.some((bool) => bool);
  }

  @action
  async updateErrorMap({ id, hasErrors }) {
    this.errorMap.set(id, !!hasErrors);
    this.errorMap = new Map(this.errorMap);
    this.args.onFormIsValid?.(!this.formHasErrors);
  }
}
