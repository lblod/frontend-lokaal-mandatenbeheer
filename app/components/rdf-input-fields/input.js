import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import SimpleInputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/simple-value-input-field';

export default class RdfInputFieldsInputComponent extends SimpleInputFieldComponent {
  inputId = 'input-' + guidFor(this);

  constructor() {
    super(...arguments);
    this.loadOptions();
  }

  loadOptions() {
    this.searchEnabled = true;

    // TODO hardcoded for now
    this.options = [
      { subject: 'testSubject1', label: 'testLabel1' },
      { subject: 'testSubject2', label: 'testLabel2' },
    ];
  }

  @action
  updateValue(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    this.value = e.target.value.trim();
    super.updateValue(this.value);
  }

  @action
  updateSelection(option) {
    this.selected = option;

    this.hasBeenFocused = true;
    super.updateValidations();
  }
}
