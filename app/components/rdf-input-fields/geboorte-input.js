import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';

import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

import { triplesForPath } from '@lblod/submission-form-helpers';
import { task, timeout } from 'ember-concurrency';
import { NamedNode } from 'rdflib';

import { replaceSingleFormValue } from 'frontend-lmb/utils/replaceSingleFormValue';
import { isPredicateInObserverChange } from 'frontend-lmb/utils/is-predicate-in-observer-change';
import { INPUT_DEBOUNCE, PERSON_PREDICATE } from 'frontend-lmb/utils/constants';
import {
  getBirthDate,
  isValidRijksregisternummer,
} from 'frontend-lmb/utils/form-validations/rijksregisternummer';
import { SKOS } from 'frontend-lmb/rdf/namespaces';

export default class RDFGeboorteInput extends InputFieldComponent {
  inputId = 'birthday-date-' + guidFor(this);

  @service store;
  @tracked date;

  constructor() {
    super(...arguments);
    this.loadProvidedValue();

    this.storeOptions.store.registerObserver(async (formChange) => {
      const mustTrigger = isPredicateInObserverChange(
        formChange,
        new NamedNode(PERSON_PREDICATE.identifier)
      );
      if (mustTrigger && !this.checkForAutomaticFillIn.isRunning) {
        await this.checkForAutomaticFillIn.perform();
      }
    });
  }

  checkForAutomaticFillIn = task(async () => {
    await timeout(INPUT_DEBOUNCE);
    if (this.getFieldSubject()) {
      const identifier = this.storeOptions.store.any(
        this.getFieldSubject(),
        PERSON_PREDICATE.identifier,
        undefined,
        this.storeOptions.sourceGraph
      );
      const rrnString = this.storeOptions.store.any(
        identifier,
        SKOS('notation'),
        undefined,
        this.storeOptions.sourceGraph
      )?.value;
      if (isValidRijksregisternummer(rrnString)) {
        const dateString = getBirthDate(rrnString);
        if (dateString) {
          this.date = new Date(dateString);
          this.onUpdate(this.date);
        }
      }
    }
  });

  getFieldSubject() {
    const matches = triplesForPath(this.storeOptions);
    if (matches.triples.length > 0) {
      return matches.triples.at(0).subject;
    }
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
    replaceSingleFormValue(this.storeOptions, date);

    super.updateValidations();
  }

  get title() {
    return this.args.field?.label || 'Geboortedatum';
  }
}
