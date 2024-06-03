import ConceptSchemeSelectorComponent from './concept-selector';

import { action } from '@ember/object';

import {
  triplesForPath,
  updateSimpleFormValue,
} from '@lblod/submission-form-helpers';

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
      if (!this.selected || this.selected.length == 0) {
        this.selected = await this.fetchSelectedOption(matches[0].value);
      }
    }
  }

  @action
  updateSelection(selectedValue) {
    this.selected = selectedValue;

    // Cleanup old value(s) in the store
    const matches = triplesForPath(this.storeOptions, true).values;
    matches.forEach((m) =>
      updateSimpleFormValue(this.storeOptions, undefined, m)
    );

    // Insert new value in the store
    if (selectedValue) {
      updateSimpleFormValue(this.storeOptions, selectedValue.subject);
    }

    super.updateSelection();
  }
}
