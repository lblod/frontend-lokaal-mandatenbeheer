import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import {
  LOKAAL_MANDAAT_CLASSIFICATIE_CODE_SCHEME_ID,
  MANDAAT_TYPE_LID_ID,
  MANDAAT_TYPE_VOORZITER_ID,
} from 'frontend-lmb/utils/well-known-ids';
import moment from 'moment';

export default class OrganenIndexController extends Controller {
  queryParams = ['sort', 'activeOrgans', 'selectedTypes', 'bestuursperiode'];
  @service store;
  @service currentSession;
  @service decretaleOrganen;
  @service router;

  @tracked sort = 'naam';
  @tracked activeOrgans = false;
  @tracked selectedTypes = ['decretaleIds', 'nietDecretaleIds'];
  @tracked bestuursperiode;

  @tracked isModalActive = false;

  get isDisabled() {
    return (
      this.model.legislatuurInBehandeling ||
      this.model.bestuursorganen.length == 0
    );
  }

  get toolTipText() {
    if (this.model.legislatuurInBehandeling) {
      return 'Tijdens het voorbereiden van een legislatuur is het niet mogelijk fracties toe te voegen.';
    }
    if (this.model.bestuursorganen.length == 0) {
      return 'Het is niet mogelijk fracties toe te voegen omdat er geen organen bestaan voor deze bestuursperiode.';
    }
    return '';
  }

  @action
  filterActiveOrgans() {
    this.activeOrgans = !this.activeOrgans;
  }

  @action
  filterOrganTypes(values) {
    this.selectedTypes = values;
  }

  @action
  selectPeriod(period) {
    this.bestuursperiode = period.id;
  }

  @action
  clearFilters() {
    this.activeOrgans = false;
    this.selectedTypes = ['decretaleIds', 'nietDecretaleIds'];
    this.bestuursperiode = null;
  }

  @action
  toggleModal() {
    if (this.isModalActive) {
      this.formInitialized = false;
    }
    this.isModalActive = !this.isModalActive;
  }

  @action
  buildSourceTtlCreateBestuursorgaan(instanceUri) {
    const bestuurseenheid = this.model.bestuurseenheid;

    return `<${instanceUri}> <http://data.vlaanderen.be/ns/besluit#bestuurt> <${bestuurseenheid.uri}> .`;
  }

  @action
  async onCreate({ instanceId }) {
    const createdBestuursorgaan = await this.store.findRecord(
      'bestuursorgaan',
      instanceId
    );
    const bestuursorgaanInTijd = await this.createDefaultBestuursorgaanInTijd(
      createdBestuursorgaan
    );
    await this.createDefaultMandaten(bestuursorgaanInTijd);

    this.toggleModal();
    this.router.transitionTo('organen.orgaan.index', instanceId);
  }

  async createDefaultBestuursorgaanInTijd(bestuursorgaan) {
    // TODO look into if we really need these dates and what they should be.
    const similarBestuursorgaanInTijd = (
      await this.model.selectedPeriod.heeftBestuursorganenInTijd
    )[0];
    const bestuursorgaanInTijd = this.store.createRecord('bestuursorgaan', {
      isTijdsspecialisatieVan: bestuursorgaan,
      heeftBestuursperiode: this.model.selectedPeriod,
      bindingStart:
        similarBestuursorgaanInTijd?.bindingStart &&
        moment(similarBestuursorgaanInTijd.bindingStart)
          .startOf('day')
          .toDate(),
      bindingEinde:
        similarBestuursorgaanInTijd?.bindingEinde &&
        moment(similarBestuursorgaanInTijd.bindingEinde)
          .startOf('day')
          .toDate(),
    });
    await bestuursorgaanInTijd.save();
    return bestuursorgaanInTijd;
  }

  async createDefaultMandaten(bestuursorgaanInTijd) {
    const bestuursfunctieCodes = await Promise.all([
      this.store.findRecord('bestuursfunctie-code', MANDAAT_TYPE_LID_ID),
      this.store.findRecord('bestuursfunctie-code', MANDAAT_TYPE_VOORZITER_ID),
    ]);

    if (this.currentSession.isProvincie) {
      const scheme = await this.store.findRecord(
        'concept-scheme',
        LOKAAL_MANDAAT_CLASSIFICATIE_CODE_SCHEME_ID,
        {
          include: 'top-concepts',
        }
      );
      const concepts = scheme ? await scheme.topConcepts : [];
      if (concepts.length >= 1) {
        const codes = await this.store.query('bestuursfunctie-code', {
          'filter[:id:]': concepts.map((c) => c.id).join(','),
          page: { size: 999 },
        });

        const codesWithoutDefault = codes.filter(
          (code) =>
            ![MANDAAT_TYPE_LID_ID, MANDAAT_TYPE_VOORZITER_ID].includes(code.id)
        );
        bestuursfunctieCodes.push(...codesWithoutDefault);
      }
    }

    const newMandates = bestuursfunctieCodes.map((code) =>
      this.store.createRecord('mandaat', {
        bestuursfunctie: code,
      })
    );
    await Promise.all(newMandates.map((m) => m.save()));

    const bevat = await bestuursorgaanInTijd.bevat;
    newMandates.forEach((m) => bevat.push(m));
    await bestuursorgaanInTijd.save();
  }
}
