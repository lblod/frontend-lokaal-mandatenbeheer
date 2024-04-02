import { action } from '@ember/object';
import { NamedNode } from 'rdflib';
import { inject as service } from '@ember/service';
import RdfInputFieldsConceptSchemeSelectorComponent from './concept-scheme-selector';

export default class RdfInputFieldsConceptSchemeSelectorWithCreateComponent extends RdfInputFieldsConceptSchemeSelectorComponent {
  @service multiUriFetcher;

  @action
  async create(name) {
    let conceptScheme = await this.multiUriFetcher.fetchUri(
      'concept-scheme',
      this.conceptScheme
    );
    let concept = await this.store.createRecord('concept', {
      label: name,
      conceptSchemes: [conceptScheme],
    });
    const response = await concept.save();
    const selection = {
      subject: new NamedNode(response.uri),
      label: concept.label,
    };
    super.updateSelection(selection);
  }

  @action
  suggest(term) {
    return `Voeg "${term}" toe`;
  }
}
