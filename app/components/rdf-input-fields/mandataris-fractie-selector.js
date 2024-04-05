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

  @tracked selectedFractie = null;
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
      sort: 'naam',
      'filter[bestuursorganen-in-tijd][:uri:]': this.bestuursorgaanUris[0],
    });
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
    this.updating = true;
    const uri = fractie?.uri;

    replaceSingleFormValue(this.storeOptions, uri ? new NamedNode(uri) : null);
    this.selectedFractie = fractie;
    this.hasBeenFocused = true;
    super.updateValidations();
    this.updating = false;
  }
}
