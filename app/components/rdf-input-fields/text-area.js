import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import SimpleInputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/simple-value-input-field';
import HelpText from '@lblod/ember-submission-form-fields/components/private/help-text';

// as taken from ember-submission-form-fields now the components are made private
export default class RdfInputFieldsTextAreaComponent extends SimpleInputFieldComponent {
  inputId = 'textarea-' + guidFor(this);
  HelpText = HelpText;

  @action
  updateValue(e) {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    this.value = e.target.value.trim();
    super.updateValue(this.value);
    this.args.onInteractedWithField?.();
  }
}
