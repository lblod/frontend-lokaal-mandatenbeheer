import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';

import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';

import { NamedNode } from 'rdflib';

import { triplesForPath } from '@lblod/submission-form-helpers';
import { replaceSingleFormValue } from 'frontend-lmb/utils/replaceSingleFormValue';
import { loadBestuursorgaanUrisFromContext } from 'frontend-lmb/utils/form-context/application-context-meta-ttl';
import { EXT, MANDAAT } from 'frontend-lmb/rdf/namespaces';
import { isPredicateInObserverChange } from 'frontend-lmb/utils/is-predicate-in-observer-change';
import { MANDATARIS_PREDICATE } from 'frontend-lmb/utils/constants';

export default class MandatarisMandaatSelector extends InputFieldComponent {
  inputId = 'input-' + guidFor(this);

  @service store;
  @service multiUriFetcher;
  @service persoonApi;
  @service('verkiezing') verkiezingService;

  @tracked mandaat = null;
  @tracked isStrictBurgemeester = false;
  @tracked initialized = false;
  @tracked bestuursorganen = [];
  @tracked person;

  @tracked mandaatOptions = null;

  constructor() {
    super(...arguments);
    this.load();
    this.storeOptions.store.registerObserver(async (formChange) => {
      const mustTrigger = isPredicateInObserverChange(
        formChange,
        new NamedNode(MANDATARIS_PREDICATE.persoon)
      );

      if (mustTrigger) {
        await this.findPerson();
        await this.updateValidations();
      }
    });
  }

  async load() {
    this.person = await this.findPersonInForm();
    await Promise.all([this.loadProvidedValue(), this.loadBestuursorganen()]);
    await this.loadMandaten();
    this.initialized = true;
  }

  async loadMandaten() {
    const mandaten = await this.store.query('mandaat', {
      sort: 'bestuursfunctie.label',
      include: 'bestuursfunctie',
      'filter[bevat-in][id]': this.bestuursorganen
        .map((o) => o.get('id'))
        .join(','),
    });
    this.mandaatOptions = mandaten;
  }

  async loadBestuursorganen() {
    const bestuursorgaanUris = loadBestuursorgaanUrisFromContext(
      this.storeOptions
    );

    if (!bestuursorgaanUris) {
      return;
    }

    this.bestuursorganen = await this.multiUriFetcher.fetchUris(
      'bestuursorgaan',
      bestuursorgaanUris
    );
  }

  async loadProvidedValue() {
    const mandaatTriples = triplesForPath(this.storeOptions, false).values;
    if (!mandaatTriples.length) {
      return;
    }
    const mandaatUri = mandaatTriples[0].value;

    const matches = await this.store.query('mandaat', {
      'filter[:uri:]': mandaatUri,
    });
    this.mandaat = matches.at(0);
  }

  @action
  async updateMandaat(mandate) {
    const uri = mandate?.uri;
    this.isStrictBurgemeester = mandate?.isStrictBurgemeester;

    replaceSingleFormValue(this.storeOptions, uri ? new NamedNode(uri) : null);
    this.mandaat = mandate;
    await this.updateValidations();
    this.hasBeenFocused = true;
  }

  async updateValidations() {
    const extraWarning = await this.checkPersonMandates();
    const extraWarning2 = await this.validatePerson();

    await super.updateValidations();
    if (extraWarning) {
      this.warningValidations.push(extraWarning);
    }
    if (extraWarning2) {
      this.warningValidations.push(extraWarning2);
    }
  }

  async checkPersonMandates() {
    const person = await this.findPersonInForm();
    this.warningValidations = this.warningValidations.filter((val) => {
      val.validationType === EXT('hasDuplicateMandate');
    });
    if (!person || !this.mandaat) {
      return;
    }
    const activeMandatees = await this.persoonApi.getPersonMandateesWithMandate(
      person.id,
      this.mandaat.id
    );
    if (
      activeMandatees.length === 0 ||
      activeMandatees.some(
        (mand) => mand.uri === this.storeOptions.sourceNode.value
      )
    ) {
      return;
    }
    return {
      validationType: EXT('hasDuplicateMandate'),
      hasValidation: true,
      valid: false,
      resultMessage:
        'Deze persoon heeft dit mandaat al in deze bestuursperiode',
    };
  }

  async validatePerson() {
    if (
      this.person &&
      this.bestuursorganen.length >= 1 &&
      !(await this.mandaat.allowsNonElectedPersons)
    ) {
      const isElected = await this.verkiezingService.checkIfPersonIsElected(
        this.person.id,
        this.bestuursorganen.at(0)
      );
      if (!isElected) {
        return {
          validationType: EXT('notElected'),
          hasValidation: true,
          valid: false,
          resultMessage:
            'De geselecteerde persoon is niet gevonden in de verkiezingslijst.',
        };
      }
    }
  }

  async findPersonInForm() {
    let newPerson = await this.findPersonInFormStore();
    if (newPerson) {
      return newPerson;
    }
    return await this.findPersonInEmber(this.storeOptions.sourceNode.value);
  }

  async findPersonInFormStore() {
    const possiblePersonNode = this.storeOptions.store.any(
      this.storeOptions.sourceNode,
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
        return personMatches.at(0);
      }
    }
  }

  async findPersonInEmber(mandatarisUri) {
    const mandatarisMatches = await this.store.query('mandataris', {
      'filter[:uri:]': mandatarisUri,
    });
    if (mandatarisMatches.length === 0) {
      return null;
    }

    return await mandatarisMatches.at(0).isBestuurlijkeAliasVan;
  }

  async findPerson() {
    const currentPerson = await this.findPersonInForm();
    if (
      (this.person && !currentPerson) ||
      (this.person && currentPerson && this.person.id !== currentPerson.id)
    ) {
      this.initialized = false;
      await Promise.all([this.loadProvidedValue(), this.loadBestuursorganen()]);
      this.initialized = true;
    }
  }
}
