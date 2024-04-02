import { action } from '@ember/object';
import {
  updateSimpleFormValue,
  triplesForPath,
} from '@lblod/submission-form-helpers';
import SelectorComponent from './selector';

export default class RdfInstanceSelectorComponent extends SelectorComponent {
  async loadProvidedValue() {
    if (this.isValid) {
      const matches = triplesForPath(this.storeOptions, true).values;
      const options = await this.fetchSelectedOption(matches[0].value);
      this.selected = options.find((opt) =>
        matches.find((m) => m.equals(opt.subject))
      );
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
