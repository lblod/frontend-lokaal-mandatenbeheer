import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input';
import { guidFor } from '@ember/object/internals';

export default class RDFRijksRegisterInput extends InputFieldComponent {
  inputId = 'rrn-' + guidFor(this);
}
