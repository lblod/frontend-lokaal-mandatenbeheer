import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';

export default class FractieCreateReplacement extends Component {
  @service toaster;
  @service fractieApi;

  @tracked label;
  @tracked isInteractedWithField;
  @tracked isLoading;

  @action
  updateLabel(event) {
    this.isInteractedWithField = true;
    this.label = event.target?.value;
  }

  @action
  async createReplacement() {
    this.isLoading = true;
    try {
      await this.fractieApi.createReplacement(
        this.args.fractieId,
        this.args.bestuursperiode?.id,
        this.label?.trim()
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
      showErrorToast(
        this.toaster,
        'Er liep iets mis bij het updaten van de fractie',
        'Fractie'
      );
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
    return !this.label || this.isSameAsOriginal || this.errorMessage;
  }

  get isSameAsOriginal() {
    return this.args.fracties.find(
      (fractie) =>
        this.args.fractieId === fractie.id &&
        fractie.naam === this.label?.trim()
    );
  }
}
