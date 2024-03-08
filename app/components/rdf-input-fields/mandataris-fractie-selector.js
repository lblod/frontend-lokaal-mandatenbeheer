import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import { triplesForPath } from '@lblod/submission-form-helpers';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { replaceSingleFormValue } from 'frontend-lmb/utils/replaceSingleFormValue';
import { NamedNode } from 'rdflib';
import { loadBestuursorgaanUrisFromContext } from 'frontend-lmb/utils/form-context/bestuursorgaan-meta-ttl';

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
 */
export default class MandatarisFractieSelector extends InputFieldComponent {
  inputId = 'input-' + guidFor(this);

  @service store;

  @tracked membership = null;
  @tracked initialized = false;
  @tracked bestuursorgaanUris = [];
  @tracked fracties = [];
  @tracked updating = false;

  constructor() {
    super(...arguments);
    this.load();
  }

  get title() {
    return this.args.field?.label || 'Fractie';
  }

  get displayValue() {
    return this.membership?.binnenFractie?.naam || 'Geen fractie geselecteerd';
  }

  async load() {
    await this.loadBestuursorgaan();
    await Promise.all([this.loadProvidedValue(), this.loadFracties()]);
    this.initialized = true;
  }

  async loadBestuursorgaan() {
    this.bestuursorgaanUris = loadBestuursorgaanUrisFromContext(
      this.storeOptions
    );
  }

  async loadFracties() {
    if (!this.bestuursorgaanUris) {
      return;
    }
    // Even if there are multiple bestuursorganen available, it should be okay to just select the first,
    // since fracties are configured on bestuurseenheid level.
    this.fracties = await this.store.query('fractie', {
      'filter[bestuursorganen-in-tijd][:uri:]': this.bestuursorgaanUris[0],
    });
  }

  async loadProvidedValue() {
    const membershipTriples = triplesForPath(this.storeOptions, false).values;
    if (!membershipTriples.length) {
      return;
    }
    const membershipUri = membershipTriples[0].value;

    const matches = await this.store.query('lidmaatschap', {
      'filter[:uri:]': membershipUri,
      include: 'binnen-fractie',
    });
    this.membership = matches.at(0);
  }

  @action
  async onSelectFractie(fractie) {
    this.updating = true;
    const newMembership = this.store.createRecord('lidmaatschap', {
      binnenFractie: fractie,
    });
    await newMembership.save();
    this.membership = newMembership;

    // Note: this process creates a new membership whenever the value of the fractie selector changes.
    // For history purposes, we shouldn't delete the old membership so if we want to view a previous
    // version of the mandataris forms, we can still see the old membership.
    // Memberships should therefore also never be modified, only created and deleted.
    replaceSingleFormValue(this.storeOptions, new NamedNode(newMembership.uri));
    this.hasBeenFocused = true;
    super.updateValidations();
    this.updating = false;
  }

  @action
  removeFractie() {
    replaceSingleFormValue(this.storeOptions, null);
    this.membership = null;
    this.hasBeenFocused = true;
    super.updateValidations();
  }
}
