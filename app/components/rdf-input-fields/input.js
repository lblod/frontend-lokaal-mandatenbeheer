import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import SimpleInputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/simple-value-input-field';
import { tracked } from '@glimmer/tracking';

export default class RdfInputFieldsInputComponent extends SimpleInputFieldComponent {
  inputId = 'input-' + guidFor(this);

  @tracked selected = null;
  @tracked options = [];
  @tracked searchEnabled = true;

  constructor() {
    super(...arguments);
    this.loadOptions();
  }

  loadOptions() {
    // TODO hardcoded for now
    this.options = [
      { subject: 'testSubject1', label: 'testLabel1' },
      { subject: 'testSubject2', label: 'testLabel2' },
    ];
  }

  @action
  updateSelection(option) {
    this.selected = option;

    this.hasBeenFocused = true;
    super.updateValidations();
  }
}
