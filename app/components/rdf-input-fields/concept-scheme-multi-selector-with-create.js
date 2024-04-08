import { action } from '@ember/object';
import { NamedNode } from 'rdflib';
import { inject as service } from '@ember/service';
import RdfInputFieldsConceptSchemeMultiSelectorComponent from './concept-scheme-multi-selector';

export default class RdfInputFieldsConceptSchemeMultiSelectorWithCreateComponent extends RdfInputFieldsConceptSchemeMultiSelectorComponent {
  @service multiUriFetcher;

  @action
  async create(name) {
    const type = this.args.field.options.type;

    let conceptScheme = await this.multiUriFetcher.fetchUri(
      'concept-scheme',
      this.conceptScheme
    );
    let concept = await this.store.createRecord(type, {
      label: name,
      conceptSchemes: [conceptScheme],
    });
    const response = await concept.save();
    const selection = {
      subject: new NamedNode(response.uri),
      label: concept.label,
    };
    let selected = this.selected;
    selected.push(selection);
    super.updateSelection(selected);
  }

  @action
  suggest(term) {
    return `Voeg "${term}" toe`;
  }

  @action
  hideCreateOptionOnSameName(term) {
    let existingOption = this.options.find(({ label }) => label === term);
    return !existingOption;
  }
}
