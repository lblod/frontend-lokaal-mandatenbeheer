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
  @tracked duplicateWarningMessage;

  constructor() {
    super(...arguments);
    this.loadProvidedValue();
  }

  get hasWarnings() {
    return this.allWarnings.length >= 1;
  }

  get allWarnings() {
    const warnings = [...this.warnings];

    if (this.duplicateWarningMessage) {
      warnings.push({ resultMessage: this.duplicateWarningMessage });
    }
    return warnings;
  }

  async loadProvidedValue() {
    const matches = triplesForPath(this.storeOptions);

    if (matches.values.length > 0) {
      this.rijksregisternummer = matches.values[0].value;
      replaceSingleFormValue(this.storeOptions, this.rijksregisternummer);
      await this.checkForDuplicates(this.rijksregisternummer);
    }
  }

  @action
  async updateValue(event) {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    const rijksregisternummer = event.target.value.trim();
    this.rijksregisternummer = rijksregisternummer;

    replaceSingleFormValue(
      this.storeOptions,
      rijksregisternummer ? rijksregisternummer : null
    );

    await this.checkForDuplicates(this.rijksregisternummer);
    this.updateValidations();

    this.hasBeenFocused = true;
  }

  async checkForDuplicates(rrn) {
    const duplicateRrns = await this.store.query('identificator', {
      'filter[:exact:identificator]': rrn,
    });
    if (duplicateRrns.length >= 1) {
      this.duplicateWarningMessage = `Er bestaat al een persoon met dit rijksregisternummer.`;
    } else {
      this.duplicateWarningMessage = null;
    }
  }
}
