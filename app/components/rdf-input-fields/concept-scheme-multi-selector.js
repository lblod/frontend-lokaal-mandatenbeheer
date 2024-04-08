import { action } from '@ember/object';
import {
  triplesForPath,
  updateSimpleFormValue,
} from '@lblod/submission-form-helpers';
import ConceptSchemeSelectorComponent from './concept-selector';

export default class RdfInputFieldsConceptSchemeMultiSelectorComponent extends ConceptSchemeSelectorComponent {
  async loadProvidedValue() {
    if (this.isValid) {
      const matches = triplesForPath(this.storeOptions, true).values;
      if (!matches || matches.length == 0) {
        return;
      }
      let preSelection = await Promise.all(
        matches.map(async (m) => {
          const result = this.options.find((opt) => m.equals(opt.subject));
          if (result) {
            return result;
          }
          return await this.fetchSelectedOption(m.value);
        })
      );
      this.selected = preSelection.filter((opt) => opt);
    }
  }

  @action
  updateSelection(options) {
    this.selected = options;

    // Retrieve options in store
    const matches = triplesForPath(this.storeOptions, true).values;
    const matchingOptions = matches.filter((m) =>
      this.options.find((opt) => m.equals(opt.subject))
    );

    // Cleanup old value(s) in the store
    matchingOptions
      .filter((m) => !options.find((opt) => m.equals(opt.subject)))
      .forEach((m) => updateSimpleFormValue(this.storeOptions, undefined, m));

    // Insert new value in the store
    options
      .filter((opt) => !matchingOptions.find((m) => opt.subject.equals(m)))
      .forEach((option) =>
        updateSimpleFormValue(this.storeOptions, option.subject)
      );

    super.updateSelection();
  }
}
