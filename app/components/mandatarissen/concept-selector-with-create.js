import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { guidFor } from '@ember/object/internals';
import { action } from '@ember/object';

export default class ConceptSelectorWithCreateComponent extends Component {
  inputId = 'select-' + guidFor(this);
  @service store;
  @service multiUriFetcher;

  @action
  async create(name) {
    const type = this.args.type;

    let conceptScheme = await this.multiUriFetcher.fetchUri(
      'concept-scheme',
      this.args.conceptScheme
    );
    let concept = await this.store.createRecord(type, {
      label: name,
      conceptSchemes: [conceptScheme],
    });
    const response = await concept.save();
    this.args.onCreate(response);
  }

  @action
  suggest(term) {
    return `Voeg "${term}" toe`;
  }

  @action
  hideCreateOptionOnSameName(term) {
    let existingOption = this.args.options.find(({ label }) => label === term);
    return !existingOption;
  }
}
