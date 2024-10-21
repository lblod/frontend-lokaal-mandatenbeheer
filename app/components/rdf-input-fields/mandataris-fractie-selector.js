import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';

import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';

import { triplesForPath } from '@lblod/submission-form-helpers';
import { replaceSingleFormValue } from 'frontend-lmb/utils/replaceSingleFormValue';
import { loadBestuursorgaanUrisFromContext } from 'frontend-lmb/utils/form-context/application-context-meta-ttl';
import { MANDAAT } from 'frontend-lmb/rdf/namespaces';
import { isPredicateInObserverChange } from 'frontend-lmb/utils/is-predicate-in-observer-change';
import { MANDATARIS_PREDICATE } from 'frontend-lmb/utils/constants';

import { NamedNode } from 'rdflib';
import { restartableTask, timeout } from 'ember-concurrency';

/**
 * The reason that the FractieSelector is a specific component is that when linking a mandataris
 * to a fractie, the link is materialized through a Lidmaadschap class, with a start and end date.
 * The start and end date for the Lidmaatschap are set to the to the start and end date of the
 * mandate, and needs to be kept in sync when the mandataris is updated.
 *
 * Furthermore, the list of fractions is filtered based on the current bestuursorgaan, which is
 * passed in as context in the meta graph of the form in the following format:
 *
 * ext:applicationContext ext:currentBestuursorgaan <bestuursorgaanUri> .
 * This bestuursorgaan is used to select the bestuursperiod in which the current form operates,
 * which is then used to fetch all bestuursorganen corresponding with that bestuursperiod.
 */
export default class MandatarisFractieSelector extends InputFieldComponent {
  inputId = 'input-' + guidFor(this);

  @service currentSession;
  @service store;
  @service router;

  @tracked selectedFractie = null;
  @tracked initialized = false;
  @tracked bestuurseenheid = null;
  @tracked bestuursperiode;
  @tracked person;
  @tracked previousPerson;
  @tracked isPersonInForm;
  @tracked isRequiredForBestuursorgaan;

  emptySelectorOptions = [];

  constructor() {
    super(...arguments);
    this.load();
    this.storeOptions.store.registerObserver(async (formChange) => {
      const mustTrigger = isPredicateInObserverChange(
        formChange,
        new NamedNode(MANDATARIS_PREDICATE.persoon)
      );

      if (mustTrigger) {
        await this.findPersonInForm.perform();
      }
    });
  }

  get title() {
    return this.args.field?.label || 'Fractie';
  }

  async load() {
    await Promise.all([
      this.findPersonInForm.perform(),
      this.loadBestuursorganen(),
      this.loadProvidedValue(),
    ]);
    this.initialized = true;
  }

  async loadBestuursorganen() {
    this.bestuurseenheid = this.currentSession.group;
    const bestuursorgaanUris = loadBestuursorgaanUrisFromContext(
      this.storeOptions
    );
    const bestuursorgaan = (
      await this.store.query('bestuursorgaan', {
        'filter[:uri:]': bestuursorgaanUris[0],
      })
    )[0];

    this.bestuursperiode = await bestuursorgaan.heeftBestuursperiode;
    await this.setIsRequiredForBestuursorgaan(bestuursorgaan);
  }

  async setIsRequiredForBestuursorgaan(bestuursorgaan) {
    if (!bestuursorgaan) {
      this.isRequiredForBestuursorgaan = this.isRequired;
      return;
    }

    const requiredWhen = [
      await bestuursorgaan.isGR,
      await bestuursorgaan.isCBS,
      await bestuursorgaan.isBurgemeester,
    ];

    this.isRequiredForBestuursorgaan = requiredWhen.some((is) => is === true);
  }

  async loadProvidedValue() {
    const fractieUris = triplesForPath(this.storeOptions, false).values;
    if (!fractieUris.length) {
      return;
    }
    const fractieUri = fractieUris[0].value;

    const matches = await this.store.query('fractie', {
      'filter[:uri:]': fractieUri,
    });
    this.selectedFractie = matches.at(0);
  }

  @action
  async onSelectFractie(fractie) {
    const uri = fractie?.uri;

    replaceSingleFormValue(this.storeOptions, uri ? new NamedNode(uri) : null);
    this.selectedFractie = fractie;
    this.hasBeenFocused = true;
    super.updateValidations();
  }

  findPersonInForm = restartableTask(async () => {
    this.isPersonInForm = false;
    let newPerson = await this.findMandatarisPersonInStore(
      this.storeOptions.sourceNode
    );
    if (!newPerson) {
      newPerson = await this.findMandatarisPersonByQuery(
        this.storeOptions.sourceNode.value
      );
    }
    await this.clearFractieIfDifferentPerson(newPerson);
    this.previousPerson = newPerson;
    this.person = newPerson;
  });

  async clearFractieIfDifferentPerson(newPerson) {
    if (!this.selectedFractie) {
      return;
    }
    if (
      !newPerson ||
      (this.previousPerson && this.previousPerson !== newPerson)
    ) {
      this.initialized = false;
      await this.onSelectFractie(null);
      // hack to have the fractie selector reinitialize and recompute the possible fractions
      await timeout(100);
      this.initialized = true;
      return;
    }
  }

  async findMandatarisPersonInStore(mandatarisNode) {
    if (mandatarisNode) {
      const possiblePersonNode = this.storeOptions.store.any(
        mandatarisNode,
        MANDAAT('isBestuurlijkeAliasVan'),
        undefined,
        this.storeOptions.sourceGraph
      );
      if (possiblePersonNode) {
        const personMatches = await this.store.query('persoon', {
          'filter[:uri:]': possiblePersonNode.value,
        });
        if (personMatches.length === 0) {
          return null;
        } else {
          this.isPersonInForm = true;
          return personMatches.at(0);
        }
      }
    }
  }

  async findMandatarisPersonByQuery(mandatarisUri) {
    const mandatarisMatches = await this.store.query('mandataris', {
      'filter[:uri:]': mandatarisUri,
    });
    if (mandatarisMatches.length === 0) {
      return null;
    }

    return await mandatarisMatches.at(0).isBestuurlijkeAliasVan;
  }
}
