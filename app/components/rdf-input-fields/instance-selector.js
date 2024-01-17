import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import { tracked } from '@glimmer/tracking';
import {
  updateSimpleFormValue,
  triplesForPath,
} from '@lblod/submission-form-helpers';
import { NamedNode } from 'rdflib';

export default class RdfInstanceSelectorComponent extends InputFieldComponent {
  inputId = 'input-' + guidFor(this);

  @tracked selected = null;
  @tracked options = [];
  @tracked searchEnabled = true;

  constructor() {
    super(...arguments);
    this.loadOptions();
    this.loadProvidedValue();
  }

  loadOptions() {
    // TODO hardcoded for now
    const test1 = new NamedNode('http://example.org/test1');
    const test2 = new NamedNode('http://example.org/test2');
    this.options = [
      {
        subject: test1,
        label: 'testLabel1',
      },
      {
        subject: test2,
        label: 'testLabel2',
      },
    ];
  }

  loadProvidedValue() {
    const matches = triplesForPath(this.storeOptions, true).values;
    this.selected = this.options.find((opt) =>
      matches.find((m) => m.equals(opt.subject))
    );
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

    this.hasBeenFocused = true;
    super.updateValidations();
  }
}
