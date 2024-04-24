import Service from '@ember/service';
import { inject as service } from '@ember/service';
import {
  getBestuursPeriods,
  getSelectedBestuursorgaanWithPeriods,
} from 'frontend-lmb/utils/bestuursperioden';

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

  // This logic should be split, this does two totally different things,
  // On te one hand fetching currently selected bestuursorganen,
  // On the other hand fetching possible bestuursperiods, which should not influence each other.
  async fetchBestuursOrganenWithTijdsperiods(organen, params) {
    let selectedPeriod;
    let bestuursPeriods = new Set();

    const selectedBestuursOrganen = await Promise.all(
      organen.map(async (bestuursorgaan) => {
        const tijdsspecialisaties =
          await bestuursorgaan.heeftTijdsspecialisaties;

        let currentBestuursorgaan;
        if (tijdsspecialisaties.length != 0) {
          // This returns undefined, if bestuursorgaan does not have a period corresponding with the params...
          const result = getSelectedBestuursorgaanWithPeriods(
            tijdsspecialisaties,
            {
              startDate: params.startDate,
              endDate: params.endDate,
            }
          );

          if (!result) {
            return null;
          }
          currentBestuursorgaan = result.bestuursorgaan;

          if (!selectedPeriod) {
            selectedPeriod = {
              startDate: result.startDate,
              endDate: result.endDate,
            };
          }
          let periods = getBestuursPeriods(tijdsspecialisaties);
          periods.forEach((item) => bestuursPeriods.add(JSON.stringify(item)));
          return currentBestuursorgaan;
        }
      })
    );
    const filteredTijdsspecialisaties = selectedBestuursOrganen.filter(
      (val) => val
    );
    const allBestuursPeriods = Array.from(bestuursPeriods).map((v) =>
      JSON.parse(v)
    );
    return {
      bestuursPeriods: Array.from(allBestuursPeriods),
      selectedPeriod,
      bestuursorganen: filteredTijdsspecialisaties,
    };
  }
}
