import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class MandatenbeheerBestuursorganenNewController extends Controller {
  @service router;
  @service store;
  @service decretaleOrganen;

  @action
  buildSourceTtl(instanceUri) {
    const bestuurseenheid = this.model.bestuurseenheid;

    return `<${instanceUri}> <http://data.vlaanderen.be/ns/besluit#bestuurt> <${bestuurseenheid.uri}> .`;
  }

  @action
  cancel() {
    this.router.transitionTo('organen.beheer');
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

    // parent route has all bestuursorganen and so needs a refresh
    await this.router.refresh();

    this.router.transitionTo('organen.beheer.edit', instanceId);
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
      isTijdsspecialisatieVan: bestuursorgaan,
      bindingStart: bestuursperiod.bindingStart,
      bindingEinde: bestuursperiod.bindingEinde,
    });
    await bestuursorgaanInTijd.save();
  }
}
