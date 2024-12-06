import RdfInputFieldsConceptSchemeSelectorComponent from './concept-scheme-selector';

import { service } from '@ember/service';

import { restartableTask, timeout } from 'ember-concurrency';
import { NamedNode } from 'rdflib';

import { isPredicateInObserverChange } from 'frontend-lmb/utils/is-predicate-in-observer-change';
import { INPUT_DEBOUNCE, PERSON_PREDICATE } from 'frontend-lmb/utils/constants';
import {
  isBiologicalMale,
  isGenderKnown,
  isValidRijksregisternummer,
} from 'frontend-lmb/utils/form-validations/rijksregisternummer';
import { SKOS } from 'frontend-lmb/rdf/namespaces';

export default class RDFGenderSelector extends RdfInputFieldsConceptSchemeSelectorComponent {
  @service store;

  constructor() {
    super(...arguments);

    this.storeOptions.store.registerObserver(async (formChange) => {
      const mustTrigger = isPredicateInObserverChange(
        formChange,
        new NamedNode(PERSON_PREDICATE.identifier)
      );
      if (mustTrigger) {
        await this.checkForAutomaticFillIn.perform();
      }
    });
  }

  checkForAutomaticFillIn = restartableTask(async () => {
    await timeout(INPUT_DEBOUNCE);
    const identifier = this.storeOptions.store.any(
      this.storeOptions.sourceNode,
      new NamedNode(PERSON_PREDICATE.identifier),
      undefined,
      this.storeOptions.sourceGraph
    );
    const rrnString = this.storeOptions.store.any(
      identifier,
      SKOS('notation'),
      undefined,
      this.storeOptions.sourceGraph
    )?.value;
    if (isValidRijksregisternummer(rrnString) && isGenderKnown(rrnString)) {
      const male = {
        subject: new NamedNode(
          'http://publications.europa.eu/resource/authority/human-sex/MALE'
        ),
        label: 'Mannelijk',
      };
      const woman = {
        subject: new NamedNode(
          'http://publications.europa.eu/resource/authority/human-sex/FEMALE'
        ),
        label: 'Vrouwelijk',
      };
      const selected = isBiologicalMale(rrnString) ? male : woman;
      if (selected) {
        this.updateSelection(selected);
      }
    }
  });

  get title() {
    return this.args.field?.label || 'Geslacht';
  }
}
