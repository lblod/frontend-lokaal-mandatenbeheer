import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { INSTALLATIVERGADERING_BEHANDELD_STATUS } from 'frontend-lmb/utils/well-known-uris';

export default class OrganenIndexController extends Controller {
  queryParams = ['sort', 'activeOrgans', 'selectedTypes', 'bestuursperiode'];
  @service store;
  @service decretaleOrganen;

  @tracked sort = 'naam';
  @tracked activeOrgans = false;
  @tracked selectedTypes = ['decretaleIds', 'nietDecretaleIds'];
  @tracked bestuursperiode;

  @tracked isModalActive = false;
  @tracked isInBehandeldLegislatuur;

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
    await this.createDefaultBestuursorgaanInTijd(createdBestuursorgaan);

    this.toggleModal();
    this.send('reloadModel');
  }

  async createDefaultBestuursorgaanInTijd(bestuursorgaan) {
    // TODO look into if we really need these dates and what they should be.
    const similarBestuursorgaanInTijd = (
      await this.model.selectedPeriod.heeftBestuursorganenInTijd
    )[0];
    const bestuursorgaanInTijd = this.store.createRecord('bestuursorgaan', {
      isTijdsspecialisatieVan: bestuursorgaan,
      heeftBestuursperiode: this.model.selectedPeriod,
      bindingStart: similarBestuursorgaanInTijd?.bindingStart,
      bindingEinde: similarBestuursorgaanInTijd?.bindingEinde,
    });
    await bestuursorgaanInTijd.save();
  }

  @action
  async setIsLegislatuurBehandeld() {
    const behandeldeVergaderingen = await this.store.query(
      'installatievergadering',
      {
        'filter[status][:uri:]': INSTALLATIVERGADERING_BEHANDELD_STATUS,
        'filter[bestuursperiode][:id:]': this.model.selectedPeriod.id,
      }
    );

    this.isInBehandeldLegislatuur = behandeldeVergaderingen.length >= 1;
  }
}
