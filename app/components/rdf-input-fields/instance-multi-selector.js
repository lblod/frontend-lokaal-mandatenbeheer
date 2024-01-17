import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import { triplesForPath } from '@lblod/submission-form-helpers';
import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import { restartableTask, timeout } from 'ember-concurrency';

export default class RdfInstanceMultiSelectorComponent extends InputFieldComponent {
  inputId = 'select-' + guidFor(this);

  @tracked selected = null;
  @tracked options = [];
  @tracked searchEnabled = true;

  get subset() {
    return this.options.slice(0, 50);
  }

  constructor() {
    super(...arguments);
    this.loadOptions();
    //this.loadProvidedValue();
  }

  loadOptions() {
    // TODO hardcoded for now
    this.options = [
      { subject: 'testMultiSubject1', label: 'testMultiLabel1' },
      { subject: 'testMultiSubject2', label: 'testMultiLabel2' },
    ];
  }

  /* loadProvidedValue() {
    if (this.isValid) {
      const matches = triplesForPath(this.storeOptions, true).values;
      this.selected = this.options.filter((opt) =>
        matches.find((m) => m.equals(opt.subject))
      );
    }
  } */

  @action
  updateSelection(options) {
    this.selected = options;

    // Retrieve options in store
    /* const matches = triplesForPath(this.storeOptions, true).values;
    const matchingOptions = matches.filter((m) =>
      this.options.find((opt) => m.equals(opt.subject))
    ); */

    // Cleanup old value(s) in the store
    /* matchingOptions
      .filter((m) => !options.find((opt) => m.equals(opt.subject)))
      .forEach((m) => updateSimpleFormValue(this.storeOptions, undefined, m));

    */
    // Insert new value in the store
    options
      //.filter((opt) => !matchingOptions.find((m) => opt.subject.equals(m)))
      .forEach((option) =>
        updateSimpleFormValue(this.storeOptions, option.subject)
      );

    this.hasBeenFocused = true;
    super.updateValidations();
  }

  search = restartableTask(async (term) => {
    await timeout(600);
    return this.options.filter((value) =>
      value.label.toLowerCase().includes(term.toLowerCase())
    );
  });
}
