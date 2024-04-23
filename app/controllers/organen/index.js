import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class OrganenIndexController extends Controller {
  @service store;
  @service decretaleOrganen;

  @tracked orgaanSort = 'naam';

  @tracked modal = false;

  @action
  toggleModal() {
    this.modal = !this.modal;
  }

  @action
  async archiveOrgaan(orgaan) {
    orgaan.deactivatedAt = new Date();
    await orgaan.save();
    this.send('reloadModel');
  }

  @action
  async deArchiveOrgaan(orgaan) {
    orgaan.deactivatedAt = undefined;
    await orgaan.save();
    this.send('reloadModel');
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
    const latestBestuursperiod = await this.getLatestBestuursorgaanInTijd();
    await this.createDefaultBestuursorgaanInTijd(
      createdBestuursorgaan,
      latestBestuursperiod
    );

    this.toggleModal();
    this.send('reloadModel');
  }

  async getLatestBestuursorgaanInTijd() {
    const bestuurseenheid = this.model.bestuurseenheid;
    const bestuursorganen = await this.store.query('bestuursorgaan', {
      'filter[is-tijdsspecialisatie-van][bestuurseenheid][id]':
        bestuurseenheid.get('id'),
      'filter[is-tijdsspecialisatie-van][:has-no:deactivated-at]': true,
      'filter[is-tijdsspecialisatie-van][classificatie][id]':
        this.decretaleOrganen.classificatieIds.join(','),
      sort: '-binding-start',
      page: {
        size: 1,
      },
    });
    return bestuursorganen.firstObject;
  }

  async createDefaultBestuursorgaanInTijd(bestuursorgaan, bestuursperiod) {
    const bestuursorgaanInTijd = this.store.createRecord('bestuursorgaan', {
      bestuurseenheid: this.model.bestuurseenheid,
      isTijdsspecialisatieVan: bestuursorgaan,
      bindingStart: bestuursperiod.bindingStart,
      bindingEinde: bestuursperiod.bindingEinde,
    });
    await bestuursorgaanInTijd.save();
  }
}
