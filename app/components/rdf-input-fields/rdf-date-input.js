import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';

import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

import { triplesForPath } from '@lblod/submission-form-helpers';

import { replaceSingleFormValue } from 'frontend-lmb/utils/replaceSingleFormValue';
import { isValidDate } from '../date-input';

export default class RdfDateInputComponent extends InputFieldComponent {
  inputId = 'date-' + guidFor(this);

  @service store;
  @tracked date;

  constructor() {
    super(...arguments);
    this.loadProvidedValue();
  }

  async loadProvidedValue() {
    const matches = triplesForPath(this.storeOptions);

    if (matches.values.length > 0) {
      const datestring = matches.values[0].value;
      this.date = new Date(datestring);
    }
  }

  @action
  onUpdate(date) {
    let workDate = null;
    if (isValidDate(date)) {
      workDate = date;
    }
    replaceSingleFormValue(this.storeOptions, workDate);

    super.updateValidations();
  }

  get title() {
    return this.args.field?.label || 'Datum';
  }
}
