import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';
import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import { triplesForPath } from '@lblod/submission-form-helpers';
import { replaceSingleFormValue } from 'frontend-lmb/utils/replaceSingleFormValue';
import moment from 'moment';
import { NamedNode } from 'rdflib';

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
  async updateValue(_isoDate, date) {
    this.geboortedatum = date;

    this.updateValidations(date);

    if (this.hasErrors) {
      return;
    }

    // TODO needs to be reviewed if there could be a more elegant solution for this.
    // This always creates a new geboorte instance when the geboortedatum field is updated.
    // This is a necessary evil for now, because we can't just update the previous instance, since we don't know
    // if the form wil actually be saved and we can't throw the previous instance away because we might want to keep
    // track of the history.
    const geboorte = await this.store
      .createRecord('geboorte', { datum: date })
      .save();
    replaceSingleFormValue(this.storeOptions, new NamedNode(geboorte.uri));

    this.hasBeenFocused = true;
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
