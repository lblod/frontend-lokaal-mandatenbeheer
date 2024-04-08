import { action } from '@ember/object';
import { NamedNode } from 'rdflib';
import RdfInputFieldsConceptSchemeMultiSelectorComponent from './concept-scheme-multi-selector';

export default class RdfInputFieldsConceptSchemeMultiSelectorWithCreateComponent extends RdfInputFieldsConceptSchemeMultiSelectorComponent {
  @action
  add(concept) {
    const selection = {
      subject: new NamedNode(concept.uri),
      label: concept.label,
    };
    let selected = this.selected ?? [];
    selected.push(selection);
    this.updateSelection(selected);
  }
}
