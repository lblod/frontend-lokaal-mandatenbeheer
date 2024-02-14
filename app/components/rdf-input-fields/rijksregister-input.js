import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import { guidFor } from '@ember/object/internals';
import {
  updateSimpleFormValue,
  triplesForPath,
} from '@lblod/submission-form-helpers';
import { isValidRijksregisternummer } from 'frontend-lmb/utils/rijksregisternummer';

export default class RDFRijksRegisterInput extends InputFieldComponent {
  inputId = 'rrn-' + guidFor(this);

  @service store;
  @tracked value;

  constructor() {
    super(...arguments);
    this.loadProvidedValue();
  }

  async loadProvidedValue() {
    const matches = triplesForPath(this.storeOptions);
    if (matches.values.length > 0) {
      const queryResult = await this.store.query('identificator', {
        filter: { ':uri:': matches.values[0].value },
      });
      if (queryResult.length >= 1) {
        const identificator = queryResult.at(0);
        this.nodeValue = identificator.uri;
        this.value = identificator.identificator;
      }
    }
  }

  @action
  async updateValue(event) {
    if (event && typeof event.preventDefault === 'function')
      event.preventDefault();
    const rijksregisternummer = event.target.value.trim();

    // TODO ideally this should also check if the other fields are compatible with the rrn
    // such as birthdate and sex, but this might be more trouble then it's worth.
    if (!isValidRijksregisternummer(rijksregisternummer)) {
      // Throw error here.
      console.log('rijksregister nummer not valid');
      return;
    }
    const identificator = await this.loadOrCreateRijksregister(
      rijksregisternummer
    );

    this.value = identificator.uri;
    this.nodeValue = identificator.identificator;

    updateSimpleFormValue(this.storeOptions, this.value, this.nodeValue);

    this.hasBeenFocused = true;

    this.updateValidations();
  }

  async loadOrCreateRijksregister(rrn) {
    let identificator;
    let queryResult = await this.store.query('identificator', {
      filter: { ':exact:identificator': rrn },
    });

    if (queryResult.length >= 1) {
      identificator = queryResult.at(0);
    } else {
      identificator = await this.store
        .createRecord('identificator', {
          identificator: rrn,
        })
        .save();
    }
    return identificator;
  }

  updateValidations() {
    // TODO some validation needs to happen here.
  }
}
