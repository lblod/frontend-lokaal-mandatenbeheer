import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';

import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

import { triplesForPath } from '@lblod/submission-form-helpers';
import { replaceSingleFormValue } from 'frontend-lmb/utils/replaceSingleFormValue';

export default class RDFRijksRegisterInput extends InputFieldComponent {
  inputId = 'rrn-' + guidFor(this);

  @service store;
  @tracked rijksregisternummer;
  @tracked duplicateErrorMessage;

  constructor() {
    super(...arguments);
    this.loadProvidedValue();
  }

  // Overwrite of InputfieldComponent
  get errors() {
    if (this.duplicateErrorMessage) {
      return [
        {
          resultMessage: this.duplicateErrorMessage,
        },
      ];
    }

    return super.errors;
  }

  async loadProvidedValue() {
    const matches = triplesForPath(this.storeOptions);

    if (matches.values.length > 0) {
      this.rijksregisternummer = matches.values[0].value;
      await this.setFormValue(this.rijksregisternummer);
    }
  }

  @action
  async updateValue(event) {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    const rijksregisternummer = event.target.value.trim();
    this.rijksregisternummer = rijksregisternummer;
    await this.setFormValue(this.rijksregisternummer);

    this.updateValidations();
    this.hasBeenFocused = true;
  }

  get isDuplicate() {
    return !!this.duplicateErrorMessage;
  }

  get shouldCheckOnDuplicateRrn() {
    return !!this.constraints.find(
      (c) =>
        c.type?.value ===
        'http://mu.semte.ch/vocabularies/ext/RijksregisternummerIsDuplicate'
    );
  }

  async checkForDuplicates(rrn) {
    // When set the value to null in the form when it is a duplicate
    // When the field is not required it will not block the user for saving the form
    if (!this.shouldCheckOnDuplicateRrn && !this.isRequired) {
      return;
    }

    const duplicateRrns = await this.store.query('identificator', {
      'filter[:exact:identificator]': rrn,
    });
    if (duplicateRrns.length >= 1) {
      this.duplicateErrorMessage = `Er bestaat al een persoon met dit rijksregisternummer.`;
    } else {
      this.duplicateErrorMessage = null;
    }
  }

  async setFormValue(rijksregisternummer) {
    let formValue = rijksregisternummer ? rijksregisternummer : null;

    await this.checkForDuplicates(this.rijksregisternummer);
    if (this.isDuplicate) {
      formValue = null;
    }
    replaceSingleFormValue(this.storeOptions, formValue);
  }
}
