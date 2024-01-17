import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import { tracked } from '@glimmer/tracking';
import { updateSimpleFormValue } from '@lblod/submission-form-helpers';

export default class RdfInputFieldsInputComponent extends InputFieldComponent {
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

    if (option) {
      updateSimpleFormValue(this.storeOptions, option.subject);
    }

    this.hasBeenFocused = true;
    super.updateValidations();
  }
}
