import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';
import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import { triplesForPath } from '@lblod/submission-form-helpers';
import { replaceSingleFormValue } from 'frontend-lmb/utils/replaceSingleFormValue';
import moment from 'moment';

export default class RDFGeboorteDatumInput extends InputFieldComponent {
  inputId = 'birthdate-' + guidFor(this);

  @service store;
  @tracked geboortedatum;

  minDate;
  maxDate;

  constructor() {
    super(...arguments);

    const now = new Date();
    const hundredYearsAgo = new Date(
      now.getFullYear() - 100,
      now.getMonth(),
      now.getDate()
    );
    const eighteenYearsAgo = new Date(
      now.getFullYear() - 18,
      now.getMonth(),
      now.getDate()
    );

    this.minDate = hundredYearsAgo;
    this.maxDate = eighteenYearsAgo;

    this.loadProvidedValue();
  }

  async loadProvidedValue() {
    const matches = triplesForPath(this.storeOptions);
    if (matches.values.length > 0) {
      const queryResult = await this.store.query('geboorte', {
        filter: { ':uri:': matches.values[0].value },
      });
      if (queryResult.length >= 1) {
        const geboorte = queryResult.at(0);
        this.geboortedatum = geboorte.datum;
      }
    }
  }

  @action
  async updateValue(isoDate, date) {
    this.geboortedatum = date;

    this.updateValidations(date);

    if (this.hasErrors) {
      return;
    }

    const geboorte = await this.loadOrCreateGeboorte(isoDate, date);

    replaceSingleFormValue(this.storeOptions, geboorte.uri);

    this.hasBeenFocused = true;
  }

  async loadOrCreateGeboorte(isoDate, date) {
    let geboorte;
    const queryResult = await this.store.query('geboorte', {
      filter: { datum: isoDate },
    });

    if (queryResult.length >= 1) {
      geboorte = queryResult.at(0);
    } else {
      geboorte = await this.store
        .createRecord('geboorte', { datum: date })
        .save();
    }
    return geboorte;
  }

  updateValidations() {
    super.updateValidations();

    if (!this.geboortedatum) {
      return;
    }

    if (this.geboortedatum < this.minDate) {
      let minDate = moment(this.minDate).format('DD-MM-YYYY');
      this.errorValidations.push({
        resultMessage: `geboortedatum moet na ${minDate} liggen`,
      });
    } else if (this.geboortedatum > this.maxDate) {
      let maxDate = moment(this.maxDate).format('DD-MM-YYYY');
      this.errorValidations.push({
        resultMessage: `geboortedatum moet voor ${maxDate} liggen`,
      });
    }

    return;
  }
}
