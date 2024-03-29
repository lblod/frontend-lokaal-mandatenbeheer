import { action } from '@ember/object';
import {
  triplesForPath,
  updateSimpleFormValue,
} from '@lblod/submission-form-helpers';
import ConceptSchemeSelectorComponent from './concept-selector';

export default class RdfInputFieldsConceptSchemeSelectorComponent extends ConceptSchemeSelectorComponent {
  async loadProvidedValue() {
    if (this.isValid) {
      const matches = triplesForPath(this.storeOptions, true).values;
      if (!matches || matches.length == 0) {
        return;
      }
      this.selected = this.options.find((opt) =>
        matches.find((m) => m.equals(opt.subject))
      );
      if (!this.selected || this.selected.lenght == 0) {
        this.selected = await this.fetchSelectedOption(matches[0].value);
      }
    }
  }

  @action
  updateSelection(option) {
    this.selected = option;

    // Cleanup old value(s) in the store
    const matches = triplesForPath(this.storeOptions, true).values;
    const matchingOptions = matches.filter((m) =>
      this.options.find((opt) => m.equals(opt.subject))
    );
    matchingOptions.forEach((m) =>
      updateSimpleFormValue(this.storeOptions, undefined, m)
    );

    // Insert new value in the store
    if (option) {
      updateSimpleFormValue(this.storeOptions, option.subject);
    }

    super.updateSelection();
  }
}
