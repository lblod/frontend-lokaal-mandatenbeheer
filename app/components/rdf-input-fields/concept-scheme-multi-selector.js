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
  updateSelection(selectedValues) {
    this.selected = selectedValues;

    // Retrieve options in store
    const matches = triplesForPath(this.storeOptions, true).values;

    // Cleanup old value(s) in the store
    matches
      .filter((m) => !selectedValues.find((opt) => m.equals(opt.subject)))
      .forEach((m) => updateSimpleFormValue(this.storeOptions, undefined, m));

    // Insert new value in the store
    selectedValues
      .filter((opt) => !matches.find((m) => opt.subject.equals(m)))
      .forEach((option) =>
        updateSimpleFormValue(this.storeOptions, option.subject)
      );

    super.updateSelection();
  }
}
