import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default class BestuursorganenService extends Service {
  @service store;
  @service decretaleOrganen;

  async getAllRealPoliticalBestuursorganen() {
    return await this.store.query('bestuursorgaan', {
      'filter[:has-no:deactivated-at]': true,
      'filter[:has-no:is-tijdsspecialisatie-van]': true,
      'filter[:has-no:original-bestuurseenheid]': true,
      'filter[classificatie][id]':
        this.decretaleOrganen.classificatieIds.join(','), // only organs with a political mandate
      include: 'classificatie,heeft-tijdsspecialisaties',
    });
  }

  async getFilteredRealPoliticalBestuursorganen(queryParams, bestuursperiode) {
    const queryOptions = {
      sort: queryParams.sort,
      page: {
        size: this.pageSize,
      },
      'filter[:has-no:is-tijdsspecialisatie-van]': true,
      'filter[:has-no:original-bestuurseenheid]': true,
      'filter[heeft-tijdsspecialisaties][heeft-bestuursperiode][:id:]':
        bestuursperiode.id,
      'filter[classificatie][:id:]':
        this.decretaleOrganen.classificatieIds.join(','),
      include: 'classificatie,heeft-tijdsspecialisaties',
    };
    if (queryParams.activeOrgans) {
      queryOptions['filter[:has-no:deactivated-at]'] = true;
    }
    return await this.store.query('bestuursorgaan', queryOptions);
  }

  async getAllPoliticalBestuursorganen() {
    return await this.store.query('bestuursorgaan', {
      'filter[:has-no:deactivated-at]': true,
      'filter[:has-no:is-tijdsspecialisatie-van]': true,
      'filter[classificatie][id]':
        this.decretaleOrganen.classificatieIds.join(','), // only organs with a political mandate
      include: 'classificatie,heeft-tijdsspecialisaties',
    });
  }
}
