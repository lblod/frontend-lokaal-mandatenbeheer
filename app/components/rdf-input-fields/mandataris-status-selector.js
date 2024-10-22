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

  @tracked mandaat = null;

  async loadMandaat() {
    const forkingStore = this.storeOptions.store;
    const mandaatUri = forkingStore.any(
      this.storeOptions.sourceNode,
      ORG('holds'),
      null,
      this.storeOptions.sourceGraph
    )?.value;

    if (!mandaatUri || this.mandaat?.uri === mandaatUri) {
      return;
    }

    this.mandaat = await queryRecord(this.store, 'mandaat', {
      'filter[:uri:]': mandaatUri,
    });

    this.options = await this.fetchOptions();
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

  constructor() {
    super(...arguments);
    this.loadMandaat();
    this.registerObserver();
  }

  async fetchOptions(searchData) {
    const statuses = await super.fetchOptions(searchData);
    const isBurgemeester = (await this.mandaat?.bestuursfunctie)
      ?.isBurgemeester;

    if (isBurgemeester) {
      return statuses.filter(
        (status) => !notBurgemeesterStates.includes(status.subject.value)
      );
    }

    return statuses.filter(
      (status) => !burgemeesterOnlyStates.includes(status.subject.value)
    );
  }
}
