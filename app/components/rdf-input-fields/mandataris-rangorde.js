import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';

import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

import { replaceSingleFormValue } from 'frontend-lmb/utils/replaceSingleFormValue';
import { ORG } from 'frontend-lmb/rdf/namespaces';
import { getByUri } from 'frontend-lmb/utils/get-by-uri';
import {
  triplesForPath,
  updateSimpleFormValue,
} from '@lblod/submission-form-helpers';
import { isPredicateInObserverChange } from 'frontend-lmb/utils/is-predicate-in-observer-change';
import { MANDATARIS_PREDICATE } from 'frontend-lmb/utils/constants';

export default class RdfMandatarisRangorde extends InputFieldComponent {
  inputId = 'rangorde-' + guidFor(this);

  @service store;
  @tracked rangorde;
  @tracked shouldRender;

  constructor() {
    super(...arguments);
    this.loadProvidedValue();
    this.registerObserver();
  }

  async loadProvidedValue() {
    const matches = triplesForPath(this.storeOptions);

    if (matches.values.length > 0) {
      this.rangorde = matches.values[0].value;
    }
  }

  registerObserver() {
    const onFormUpdate = () => {
      if (this.isDestroyed) {
        return;
      }

      this.checkIfShouldRender();
    };
    this.storeOptions.store.registerObserver((formChange) => {
      const mustTrigger = isPredicateInObserverChange(
        formChange,
        MANDATARIS_PREDICATE.mandaat
      );

      if (mustTrigger) {
        onFormUpdate();
      }
    });
    onFormUpdate();
  }

  async checkIfShouldRender() {
    const mandaatUri = this.storeOptions.store.match(
      this.storeOptions.sourceNode,
      ORG('holds'),
      undefined,
      this.storeOptions.sourceGraph
    );

    const mandaat = await getByUri(
      this.store,
      'mandaat',
      mandaatUri[0]?.object?.value,
      { include: 'bestuursfunctie' }
    );
    this.shouldRender = mandaat?.hasRangorde;

    if (!this.shouldRender && this.rangorde != null) {
      // without timeout, the form ttl doesn't update immediately
      setTimeout(() => {
        this.rangorde = null;
        // clear selection
        const matches = triplesForPath(this.storeOptions, true).values;

        // Cleanup old value(s) in the store
        matches.forEach((m) =>
          updateSimpleFormValue(this.storeOptions, undefined, m)
        );
      }, 100);
    }
  }

  @action
  async updateValue(event) {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    const rangorde = event.target.value.trim();
    this.rangorde = rangorde;

    replaceSingleFormValue(this.storeOptions, rangorde ? rangorde : null);

    this.updateValidations();

    this.hasBeenFocused = true;
  }
}
