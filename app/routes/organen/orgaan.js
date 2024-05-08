import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { queryRecord } from 'frontend-lmb/utils/query-record';
import { BESTUURSORGAAN_FORM_ID } from 'frontend-lmb/utils/well-known-ids';
import RSVP from 'rsvp';

export default class OrganenOrgaanRoute extends Route {
  @service store;

  queryParams = {
    bestuursperiode: { refreshModel: true },
  };

  async model(params) {
    const bestuursorgaanId = params.id;

    const bestuursorgaan = await this.store.findRecord(
      'bestuursorgaan',
      bestuursorgaanId,
      {
        include: 'classificatie,heeft-tijdsspecialisaties',
      }
    );

    const bestuursPeriods = await this.store.query('bestuursperiode', {
      sort: 'label',
      filter: {
        'heeft-bestuursorganen-in-tijd': {
          'is-tijdsspecialisatie-van': {
            id: bestuursorgaanId,
          },
        },
      },
    });
    let selectedPeriod;
    if (params.bestuursperiode) {
      selectedPeriod = bestuursPeriods.find((period) => {
        return period.id == params.bestuursperiode;
      });
    } else {
      // TODO: temporary, should be the closest one if no query params.
      selectedPeriod = bestuursPeriods.at(-1);
    }

    const currentBestuursorgaan = await queryRecord(
      this.store,
      'bestuursorgaan',
      {
        filter: {
          'is-tijdsspecialisatie-van': {
            id: bestuursorgaanId,
          },
          'heeft-bestuursperiode': {
            id: selectedPeriod.id,
          },
        },
      }
    );

    const bestuursorgaanFormDefinition = getFormFrom(
      this.store,
      BESTUURSORGAAN_FORM_ID
    );

    return RSVP.hash({
      bestuursorgaanFormDefinition,
      instanceId: bestuursorgaanId,
      bestuursorgaan,
      bestuursPeriods,
      selectedPeriod,
      currentBestuursorgaan,
    });
  }
}
