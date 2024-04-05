import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import { guidFor } from '@ember/object/internals';
import { triplesForPath } from '@lblod/submission-form-helpers';
import { replaceSingleFormValue } from 'frontend-lmb/utils/replaceSingleFormValue';

export default class RDFRijksRegisterInput extends InputFieldComponent {
  inputId = 'rrn-' + guidFor(this);

  @service store;
  @tracked rijksregisternummer;

  constructor() {
    super(...arguments);
    this.loadProvidedValue();
  }

  async loadProvidedValue() {
    const matches = triplesForPath(this.storeOptions);

    if (matches.values.length > 0) {
      this.rijksregisternummer = matches.values[0].value;
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

    this.updateValidations();

    this.hasBeenFocused = true;
  }
}
