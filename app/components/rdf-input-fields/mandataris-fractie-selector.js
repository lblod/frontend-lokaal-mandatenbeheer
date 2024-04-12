import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import { triplesForPath } from '@lblod/submission-form-helpers';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { replaceSingleFormValue } from 'frontend-lmb/utils/replaceSingleFormValue';
import { NamedNode } from 'rdflib';

/**
 * The reason that the FractieSelector is a specific component is that when linking a mandataris
 * to a fractie, the link is materialized through a Lidmaadschap class, with a start and end date.
 * The start and end date for the Lidmaatschap are set to the to the start and end date of the
 * mandate, and needs to be kept in sync when the mandataris is updated.
 */
export default class MandatarisFractieSelector extends InputFieldComponent {
  inputId = 'input-' + guidFor(this);

  @service currentSession;
  @service tijdsspecialisaties;
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
    const params = this.router.currentRoute.queryParams;
    this.bestuursorganenInTijd =
      await this.tijdsspecialisaties.getCurrentTijdsspecialisaties(
        this.store,
        this.bestuurseenheid,
        params
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
