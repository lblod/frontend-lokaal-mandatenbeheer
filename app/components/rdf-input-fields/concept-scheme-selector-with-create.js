import { action } from '@ember/object';
import { NamedNode } from 'rdflib';
import RdfInputFieldsConceptSchemeSelectorComponent from './concept-scheme-selector';

export default class RdfInputFieldsConceptSchemeSelectorWithCreateComponent extends RdfInputFieldsConceptSchemeSelectorComponent {
  @action
  add(concept) {
    const selection = {
      subject: new NamedNode(concept.uri),
      label: concept.label,
    };
    this.updateSelection(selection);
  }
}
