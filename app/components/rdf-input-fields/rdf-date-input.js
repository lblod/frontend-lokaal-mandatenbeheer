import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';

import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

import moment from 'moment';
import { triplesForPath } from '@lblod/submission-form-helpers';

import { replaceSingleFormValue } from 'frontend-lmb/utils/replaceSingleFormValue';
import { NULL_DATE } from 'frontend-lmb/utils/constants';

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
      const ttlDate = new Date(datestring);
      if (moment(ttlDate).isSame(moment(NULL_DATE))) {
        this.date = null;
      } else {
        this.date = ttlDate;
      }
    }
  }

  @action
  onUpdate(date) {
    replaceSingleFormValue(this.storeOptions, date);

    super.updateValidations();
  }

  get title() {
    return this.args.field?.label || 'Datum';
  }
}
