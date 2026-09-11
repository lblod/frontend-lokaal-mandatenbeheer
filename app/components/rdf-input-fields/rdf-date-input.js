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
import { EXT, FIELD_OPTION, ORG, SHACL } from 'frontend-lmb/rdf/namespaces';
import {
  loadBestuursorgaanPeriodFromContext,
  loadFractieStartEndDateFromStore,
} from 'frontend-lmb/utils/form-context/application-context-meta-ttl';
import { isPredicateInObserverChange } from 'frontend-lmb/utils/is-predicate-in-observer-change';
import getMinMaxDateBetweenOrgaanAndFractiePeriod from 'frontend-lmb/utils/getStartEndDateForFractiePeriod';

export default class RdfDateInputComponent extends InputFieldComponent {
  inputId = 'date-' + guidFor(this);

  @service store;
  @tracked date;
  @tracked from;
  @tracked to;
  @tracked endOfDay;
  @tracked hasMandatarisDateValidation = false;

  constructor() {
    super(...arguments);
    this.loadProvidedValue();
    this.loadOptions();

    this.storeOptions.store.registerObserver(async (formChange) => {
      const triggerForFractie = isPredicateInObserverChange(
        formChange,
        ORG('organisation')
      );

      if (triggerForFractie && this.hasMandatarisDateValidation) {
        await this.loadDateBounds();
      }
    });
  }

  async loadProvidedValue() {
    const matches = triplesForPath(this.storeOptions);

    if (matches.values.length > 0) {
      const datestring = matches.values[0].value;
      this.date = new Date(datestring);
    }

    const results = await Promise.all([
      validationResultsForField(this.args.field.uri, {
        severity: SHACL('Violation'),
        ...this.storeOptions,
      }),
      validationResultsForField(this.args.field.uri, {
        severity: SHACL('Warning'),
        ...this.storeOptions,
      }),
    ]);

    this.hasMandatarisDateValidation = [...results[0], ...results[1]].some(
      (validation) =>
        validation.validationType === EXT('ValidMandatarisDate').value
    );
    if (this.hasMandatarisDateValidation) {
      await this.loadDateBounds();
    }
  }

  async loadDateBounds() {
    const period = loadBestuursorgaanPeriodFromContext(this.storeOptions);
    const fractiePeriod = await loadFractieStartEndDateFromStore(
      this.storeOptions
    );

    const { minDate, maxDate } = getMinMaxDateBetweenOrgaanAndFractiePeriod(
      period,
      fractiePeriod
    );

    this.from = minDate;
    this.to = maxDate;
  }

  loadOptions() {
    this.endOfDay = !!this.args.formStore.any(
      this.args.field.uri,
      FIELD_OPTION('endOfDay'),
      undefined,
      this.args.graphs.formGraph
    );
  }

  @action
  onUpdate(date) {
    replaceSingleFormValue(this.storeOptions, date);

    this.hasBeenFocused = true;
    super.updateValidations();
    this.args.onInteractedWithField?.();
  }

  get title() {
    return this.args.field?.label || 'Datum';
  }
}
