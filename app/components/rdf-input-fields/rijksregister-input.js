import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import { guidFor } from '@ember/object/internals';
import { triplesForPath } from '@lblod/submission-form-helpers';
import { isValidRijksregisternummer } from 'frontend-lmb/utils/rijksregisternummer';
import { replaceSingleFormValue } from 'frontend-lmb/utils/replaceSingleFormValue';
import { NamedNode } from 'rdflib';

export default class RDFRijksRegisterInput extends InputFieldComponent {
  inputId = 'rrn-' + guidFor(this);

  @service store;
  @tracked rijksregisternummer;

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
        this.rijksregisternummer = identificator.identificator;
      }
    }
  }

  @action
  async updateValue(event) {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    this.rijksregisternummer = event.target.value.trim();

    this.updateValidations();

    if (this.hasErrors) {
      return;
    }

    const identificator = await this.loadOrCreateRijksregister(
      this.rijksregisternummer
    );

    replaceSingleFormValue(this.storeOptions, new NamedNode(identificator.uri));

    this.hasBeenFocused = true;
  }

  async loadOrCreateRijksregister(rrn) {
    let identificator;
    const queryResult = await this.store.query('identificator', {
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
    super.updateValidations();

    if (!this.rijksregisternummer) {
      return;
    }

    // TODO ideally this should also check if the other fields are compatible with the rrn
    // such as birthdate and sex, but this might be more trouble then it's worth.
    if (!isValidRijksregisternummer(this.rijksregisternummer)) {
      this.errorValidations.push({
        resultMessage: 'ongeldig rijksregisternummer',
      });
      return;
    }
  }
}
