import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';

import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

import { replaceSingleFormValue } from 'frontend-lmb/utils/replaceSingleFormValue';
import { triplesForPath } from '@lblod/submission-form-helpers';
import { isValidDate } from '../date-input';
import { FORM } from 'frontend-lmb/rdf/namespaces';
import { isValidForm } from 'frontend-lmb/utils/is-valid-form';

export default class RdfDateInputComponent extends InputFieldComponent {
  inputId = 'date-' + guidFor(this);

  @service store;
  @tracked date;

  constructor() {
    super(...arguments);
    this.loadProvidedValue();
    this.setValidationValues();
  }

  async setValidationValues() {
    const { store, sourcenode, formGraph } = this.storeOptions;
    const validationNodes = store.match(
      sourcenode,
      FORM('validatedBy'),
      undefined,
      formGraph
    );
    console.log({ validationNodes });
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
    if (isValidDate(date)) {
      replaceSingleFormValue(this.storeOptions, date); // Doing this for now as this field should be mandatory
      super.updateValidations();
    }

    const isValid = isValidForm({ ...this.storeOptions });
    console.log(isValid);
  }

  get title() {
    return this.args.field?.label || 'Datum';
  }
}
