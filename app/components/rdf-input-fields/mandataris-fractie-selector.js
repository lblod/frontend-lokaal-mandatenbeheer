import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import { triplesForPath } from '@lblod/submission-form-helpers';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { replaceSingleFormValue } from 'frontend-lmb/utils/replaceSingleFormValue';
import { EXT } from 'frontend-lmb/rdf/namespaces';
import { NamedNode } from 'rdflib';

/**
 * The reason that the FractieSelector is a specific component is that when linking a mandataris
 * to a fractie, the link is materialized through a Lidmaadschap class, with a start and end date.
 * The start and end date for the Lidmaatschap are set to the to the start and end date of the
 * currently selected bestuursorgaan (in bestuursperiode).
 *
 * This information is to be passed in to the meta graph as context in the following format:
 *
 * ext:applicationContext ext:currentBestuursorgaan <bestuursorgaanUri> .
 * <bestuursorgaanUri> mandaat:bindingStart <startDate> ;
 *                     mandaat:bindingEinde <endDate> .
 */
export default class MandatarisFractieSelector extends InputFieldComponent {
  inputId = 'input-' + guidFor(this);

  @service store;

  @tracked membership = null;
  @tracked initialized = false;
  @tracked bestuursorgaan = null;
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
    const forkingStore = this.storeOptions.store;
    const bestuursorgaanUri = forkingStore.any(
      EXT('applicationContext'),
      EXT('currentBestuursorgaan'),
      null,
      this.storeOptions.metaGraph
    );

    const orgaan = await this.store.query('bestuursorgaan', {
      'filter[:uri:]': bestuursorgaanUri.value,
    });
    this.bestuursorgaan = orgaan.at(0);
  }

  async loadFracties() {
    if (!this.bestuursorgaan) {
      return;
    }
    const fracties = await this.store.query('fractie', {
      // TODO if this works, we can also not fetch the full orgaan and just use the triples in the meta graph
      'filter[bestuursorganen-in-tijd][:uri:]': this.bestuursorgaan.uri,
    });
    this.fracties = fracties;
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
      // TODO tijdsinterval should be the same as the duration of the mandataris,
      // either deal with this in the backend or in the onsave of the mandataris forms...
      binnenFractie: fractie,
    });
    await newMembership.save();
    this.membership = newMembership;

    // TODO clean up unused membership records? (see address-selector)
    // for history purposes we may want to keep them around though...
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
