import RdfInputFieldsConceptSchemeSelectorComponent from './concept-scheme-selector';

import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { NamedNode } from 'rdflib';

import { queryRecord } from 'frontend-lmb/utils/query-record';
import {
  burgemeesterOnlyStates,
  notBurgemeesterStates,
} from 'frontend-lmb/utils/well-known-uris';
import { ORG } from 'frontend-lmb/rdf/namespaces';
import { isPredicateInObserverChange } from 'frontend-lmb/utils/is-predicate-in-observer-change';
import { MANDATARIS_PREDICATE } from 'frontend-lmb/utils/constants';

export default class RdfInputFieldsMandatarisStatusSelectorComponent extends RdfInputFieldsConceptSchemeSelectorComponent {
  @service store;

  @tracked filterCb;

  constructor() {
    super(...arguments);
    this.registerObserver();
  }

  registerObserver() {
    const onFormUpdate = async () => {
      if (this.isDestroyed) {
        return;
      }

      await this.loadMandaat();
    };
    this.storeOptions.store.registerObserver(async (formChange) => {
      const mustTrigger = isPredicateInObserverChange(
        formChange,
        new NamedNode(MANDATARIS_PREDICATE.mandaat)
      );

      if (mustTrigger) {
        await onFormUpdate();
      }
    });
    onFormUpdate();
  }

  async loadMandaat() {
    const { store, sourceNode, sourceGraph } = this.storeOptions;
    const mandaatUri = store.any(
      sourceNode,
      ORG('holds'),
      null,
      sourceGraph
    )?.value;

    if (!mandaatUri || this.mandaat?.uri === mandaatUri) {
      return;
    }

    const mandaat = await queryRecord(this.store, 'mandaat', {
      'filter[:uri:]': mandaatUri,
      includes: 'bestuursfunctie-code',
    });
    const bestuursfunctieCode = await mandaat.bestuursfunctie;
    this.updateOptionsFilter(bestuursfunctieCode);
  }

  get filteredOptions() {
    if (!this.filterCb) {
      return this.options;
    }
    return this.options.filter(this.filterCb);
  }

  updateOptionsFilter(bestuursfunctieCode) {
    if (!bestuursfunctieCode) {
      return;
    }
    if (bestuursfunctieCode.isBurgemeester) {
      this.filterCb = (status) =>
        !notBurgemeesterStates.includes(status.subject.value);
    } else {
      this.filterCb = (status) =>
        !burgemeesterOnlyStates.includes(status.subject.value);
    }
  }
}
