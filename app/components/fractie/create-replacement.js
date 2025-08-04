import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { showSuccessToast } from 'frontend-lmb/utils/toasts';

import moment from 'moment';
export default class FractieCreateReplacement extends Component {
  @service toaster;
  @service fractieApi;

  @tracked label;
  @tracked endDate;
  @tracked minDate;

  @tracked isInteractedWithField;
  @tracked isLoading;

  constructor() {
    super(...arguments);
    this.minDate = new Date();
    this.endDate = new Date();
    const currentModel = this.args.fracties?.find(
      (f) => f.id === this.args.fractieId
    );
    this.minDate = moment(currentModel?.startDate).add(1, 'days').toDate();

    if (moment(this.minDate).isAfter(new Date())) {
      this.endDate = this.minDate;
    }
  }

  @action
  updateLabel(event) {
    this.isInteractedWithField = true;
    this.label = event.target?.value;
  }

  @action
  updateEndDate(date) {
    this.endDate = date;
  }

  @action
  async createReplacement() {
    this.isLoading = true;
    try {
      await this.fractieApi.createReplacement(
        this.args.fractieId,
        this.label?.trim(),
        this.endDate
      );
      this.isLoading = false;
      showSuccessToast(
        this.toaster,
        'De nieuwe fractie werd aangemaakt',
        'Fractie'
      );
      this.args.onCompleted?.();
    } catch (error) {
      this.isLoading = false;
    }
  }

  get errorMessage() {
    if (!this.isInteractedWithField) {
      return null;
    }
    return this.errorMessageMapping.find((error) => error.condition)?.message;
  }

  get errorMessageMapping() {
    return [
      {
        condition: this.label?.trim() === '',
        message: 'Dit veld is verplicht',
      },
      {
        condition: this.args.fracties.find(
          (fractie) =>
            fractie.id !== this.args.fractieId &&
            fractie.naam === this.label?.trim()
        ),
        message: 'Er is al een fractie met dit label',
      },
    ];
  }

  get isDisabled() {
    return (
      !this.label || this.isSameAsOriginal || this.errorMessage || !this.endDate
    );
  }

  get isSameAsOriginal() {
    return this.args.fracties.find(
      (fractie) =>
        this.args.fractieId === fractie.id &&
        fractie.naam === this.label?.trim()
    );
  }
}
