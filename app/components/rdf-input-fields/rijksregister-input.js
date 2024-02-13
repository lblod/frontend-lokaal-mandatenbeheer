import { action } from '@ember/object';
import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import { guidFor } from '@ember/object/internals';
import {
  updateSimpleFormValue,
  triplesForPath,
} from '@lblod/submission-form-helpers';

export default class RDFRijksRegisterInput extends InputFieldComponent {
  inputId = 'rrn-' + guidFor(this);

  constructor() {
    super(...arguments);
    this.loadProvidedValue();
  }

  loadProvidedValue() {
    const matches = triplesForPath(this.storeOptions);
    if (matches.values.length > 0) {
      this.nodeValue = matches.values[0];
      this.value = matches.values[0].value;
    }
  }

  @action
  updateValue(event) {
    if (event && typeof event.preventDefault === 'function')
      event.preventDefault();
    this.value = event.target.value.trim();
    updateSimpleFormValue(this.storeOptions, this.value, this.nodeValue);

    this.hasBeenFocused = true;
    this.loadProvidedValue();

    this.updateValidations();
  }

  updateValidations() {
    // TODO some validation needs to happen here.
  }
}
