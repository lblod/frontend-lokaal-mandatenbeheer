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
 * This bestuursorgaan is used to select the bestuursperiod in which the current form operates,
 * which is then used to fetch all bestuursorganen corresponding with that bestuursperiod.
 */
export default class MandatarisFractieSelector extends InputFieldComponent {
  inputId = 'input-' + guidFor(this);

  @service currentSession;
  @service bestuursperioden;
  @service store;
  @service router;

  @tracked selectedFractie = null;
  @tracked initialized = false;
  @tracked bestuurseenheid = null;
  @tracked bestuursorganenInTijd = [];

  constructor() {
    super(...arguments);
    this.load();
  }

  get title() {
    return this.args.field?.label || 'Fractie';
  }

  async load() {
    await Promise.all([this.loadBestuursorganen(), this.loadProvidedValue()]);
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

    const bestuursperiode = await bestuursorgaan.heeftBestuursperiode;
    this.bestuursorganenInTijd =
      await this.bestuursperioden.getRelevantTijdsspecialisaties(
        bestuursperiode
      );
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
}
