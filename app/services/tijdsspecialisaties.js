import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { getSelectedBestuursorgaanWithPeriods } from 'frontend-lmb/utils/bestuursperioden';

export default class TijdsspecialisatiesService extends Service {
  @service store;
  @service decretaleOrganen;

  async getCurrentTijdsspecialisaties(store, bestuurseenheid, params) {
    const bestuursorganen = await store.query('bestuursorgaan', {
      'filter[bestuurseenheid][id]': bestuurseenheid.id,
      'filter[:has-no:deactivated-at]': true,
      'filter[:has-no:is-tijdsspecialisatie-van]': true,
      'filter[classificatie][id]':
        this.decretaleOrganen.classificatieIds.join(','), // only organs with a political mandate
      include: 'classificatie,heeft-tijdsspecialisaties',
    });

    return await this.fetchTijdsspecialisaties(bestuursorganen, params);
  }

  async fetchTijdsspecialisaties(organen, params) {
    const selectedTijdsspecialisaties = await Promise.all(
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
    return selectedTijdsspecialisaties.filter(Boolean);
  }
}