import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';

import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

import {
  triplesForPath,
  validationResultsForField,
} from '@lblod/submission-form-helpers';

import { replaceSingleFormValue } from 'frontend-lmb/utils/replaceSingleFormValue';
import { EXT } from 'frontend-lmb/rdf/namespaces';
import { loadBestuursorgaanPeriodFromContext } from 'frontend-lmb/utils/form-context/application-context-meta-ttl';

export default class RdfDateInputComponent extends InputFieldComponent {
  inputId = 'date-' + guidFor(this);

  @service store;
  @tracked date;
  @tracked from;
  @tracked to;

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

    const validations = validationResultsForField(
      this.args.field.uri,
      this.storeOptions
    );
    const hasMandatarisDateValidation = validations.some(
      (validation) =>
        validation.validationType === EXT('ValidMandatarisDate').value
    );
    if (hasMandatarisDateValidation) {
      const { startDate, endDate } = loadBestuursorgaanPeriodFromContext(
        this.storeOptions
      );
      this.from = startDate;
      this.to = endDate;
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
