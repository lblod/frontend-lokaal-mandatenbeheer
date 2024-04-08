import { action } from '@ember/object';
import {
  triplesForPath,
  updateSimpleFormValue,
} from '@lblod/submission-form-helpers';
import SelectorComponent from './selector';

export default class RdfInstanceMultiSelectorComponent extends SelectorComponent {
  async loadProvidedValue() {
    if (this.isValid) {
      const matches = triplesForPath(this.storeOptions, true).values;
      let options = await Promise.all(
        matches.map(async (m) => {
          return (await this.fetchSelectedOption(m.value))[0];
        })
      );
      this.selected = options.filter((opt) => opt);
    }
  }

  @action
  updateSelectedItems(selectedValues) {
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

    super.updateSelectedItems();
  }
}
