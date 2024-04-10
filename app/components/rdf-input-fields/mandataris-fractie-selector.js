import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import { triplesForPath } from '@lblod/submission-form-helpers';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { replaceSingleFormValue } from 'frontend-lmb/utils/replaceSingleFormValue';
import { NamedNode } from 'rdflib';
import { getSelectedBestuursorgaanWithPeriods } from 'frontend-lmb/utils/bestuursperioden';

/**
 * The reason that the FractieSelector is a specific component is that when linking a mandataris
 * to a fractie, the link is materialized through a Lidmaadschap class, with a start and end date.
 * The start and end date for the Lidmaatschap are set to the to the start and end date of the
 * mandate, and needs to be kept in sync when the mandataris is updated.
 */
export default class MandatarisFractieSelector extends InputFieldComponent {
  inputId = 'input-' + guidFor(this);

  @service currentSession;
  @service store;
  @service router;

  @tracked selectedFractie = null;
  @tracked initialized = false;
  @tracked bestuurseeneenheid = null;
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
    const queryParams = this.router.currentRoute.queryParams;

    const bestuursorganen = await this.store.query('bestuursorgaan', {
      'filter[bestuurseenheid][id]': this.bestuurseenheid.id,
      'filter[:has-no:deactivated-at]': true,
      'filter[:has-no:is-tijdsspecialisatie-van]': true,
      'filter[classificatie][id]':
        this.decretaleOrganen.classificatieIds.join(','), // only organs with a political mandate
      include: 'classificatie,heeft-tijdsspecialisaties',
    });

    this.bestuursorganenInTijd = await this.fetchBestuursOrganen(
      bestuursorganen,
      queryParams
    );
  }

  async fetchBestuursOrganen(organen, params) {
    const zever = await Promise.all(
      organen.map(async (bestuursorgaan) => {
        const tijdsspecialisaties =
          await bestuursorgaan.heeftTijdsspecialisaties;

        if (tijdsspecialisaties.length != 0) {
          const result = getSelectedBestuursorgaanWithPeriods(
            tijdsspecialisaties,
            {
              startDate: params.startDate,
              endDate: params.endDate,
            }
          );
          return result ? result.bestuursorgaan : null;
        }
      })
    );
    return zever.filter(Boolean);
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
