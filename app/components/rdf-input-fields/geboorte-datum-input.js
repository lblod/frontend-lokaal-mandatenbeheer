import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import SimpleInputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/simple-value-input-field';
import { XSD } from '@lblod/submission-form-helpers';
import { literal } from 'rdflib';

export default class RDFGeboorteDatumInput extends SimpleInputFieldComponent {
  inputId = 'birthdate-' + guidFor(this);

  @action
  updateValue(isoDate) {
    const newDate = isoDate ? literal(isoDate, XSD('date')) : null;
    super.updateValue(newDate);
  }
}
