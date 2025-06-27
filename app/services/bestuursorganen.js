import Service from '@ember/service';

import { service } from '@ember/service';

export default class BestuursorganenService extends Service {
  @service store;
  @service decretaleOrganen;
  @service bestuursperioden;
  @service features;
  @service currentSession;

  async getAllRealPoliticalBestuursorganen() {
    return await this.store.query('bestuursorgaan', {
      'filter[:has-no:deactivated-at]': true,
      'filter[:has-no:is-tijdsspecialisatie-van]': true,
      'filter[:has-no:original-bestuurseenheid]': true,
      'filter[bestuurseenheid][:id:]': this.currentSession.group.id,
      'filter[classificatie][id]':
        this.decretaleOrganen.classificatieIds.join(','), // only organs with a political mandate
      include: 'classificatie,heeft-tijdsspecialisaties',
    });
  }

  async getRealCurrentPoliticalBestuursorganen() {
    const currentPeriod =
      await this.bestuursperioden.getCurrentBestuursperiode();
    return await this.store.query('bestuursorgaan', {
      'filter[:has-no:deactivated-at]': true,
      'filter[:has-no:is-tijdsspecialisatie-van]': true,
      'filter[:has-no:original-bestuurseenheid]': true,
      'filter[heeft-tijdsspecialisaties][heeft-bestuursperiode][:id:]':
        currentPeriod.id,
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
      include: 'classificatie,heeft-tijdsspecialisaties',
    };
    if (queryParams.activeOrgans) {
      queryOptions['filter[:has-no:deactivated-at]'] = true;
    }
    let filteredTypes = ['decretaleIds'];
    if (this.features.isEnabled('custom-organen')) {
      filteredTypes = queryParams.selectedTypes;
    }
    const types = filteredTypes.map((type) => {
      return this.decretaleOrganen.get(type).join(',');
    });
    queryOptions['filter[classificatie][:id:]'] = types.join(',');
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

  async getAllRelevantPoliticalBestuursorganenInTijd(bestuursperiode) {
    return await this.store.query('bestuursorgaan', {
      'filter[:has-no:heeft-tijdsspecialisaties]': true,
      'filter[heeft-bestuursperiode][:id:]': bestuursperiode.id,
      'filter[is-tijdsspecialisatie-van][:has-no:deactivated-at]': true,
      'filter[is-tijdsspecialisatie-van][classificatie][id]':
        this.decretaleOrganen.classificatieIds.join(','), // only organs with a political mandate
      include:
        'is-tijdsspecialisatie-van,is-tijdsspecialisatie-van.classificatie',
    });
  }
}
