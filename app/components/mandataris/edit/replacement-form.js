import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';

import { tracked } from '@glimmer/tracking';

import {
  isDisabledForBestuursorgaan,
  isRequiredForBestuursorgaan,
} from 'frontend-lmb/utils/is-fractie-selector-required';
import { getNietBekrachtigdPublicationStatus } from 'frontend-lmb/utils/get-mandataris-status';

export default class MandatarisEditReplacementForm extends Component {
  @service store;
  @service('mandataris') mandatarisService;

  @tracked person;
  @tracked startDate;
  @tracked endDate;
  @tracked fractie;

  @tracked replacementMandataris;
  @tracked replacementLidmaatschap;

  @tracked overlappingMandate;
  @tracked hasReplacementError;
  @tracked errorMap = new Map();

  constructor() {
    super(...arguments);
    this.errorMap.set('startDate', true);
    this.errorMap.set('fractie', true);
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
    const formValues = {};
    if (!this.formHasErrors) {
      if (this.replacementMandataris && this.replacementLidmaatschap) {
        this.replacementMandataris.rollbackAttributes();
        this.replacementLidmaatschap.rollbackAttributes();
        this.args.mandataris.tijdelijkeVervangingen = [];
      }

      const newMandatarisProps = await this.mandatarisService.createNewProps(
        this.args.mandataris,
        {
          start: this.startDate,
          einde: this.endDate,
          rangorde: '',
          publicationStatus: await getNietBekrachtigdPublicationStatus(
            this.store
          ),
        }
      );

      this.replacementMandataris =
        await this.mandatarisService.getOrCreateReplacement(
          this.args.mandataris,
          this.person,
          newMandatarisProps,
          { saveWhenCreated: false }
        );
      this.args.mandataris.tijdelijkeVervangingen = [
        this.replacementMandataris,
      ];
      this.replacementLidmaatschap =
        await this.mandatarisService.createNewLidmaatschap(
          this.replacementMandataris,
          this.fractie,
          { saveWhenCreated: true }
        );
      formValues.mandataris = this.args.mandataris;
      formValues.replacementMandataris = this.replacementMandataris;
      formValues.replacementLidmaatschap = this.replacementLidmaatschap;
    }

    this.args.onFormIsValid?.(!this.formHasErrors, formValues);
  }
}
