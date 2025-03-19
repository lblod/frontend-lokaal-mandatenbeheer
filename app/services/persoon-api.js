import Service from '@ember/service';

import { service } from '@ember/service';

import { timeout } from 'ember-concurrency';

import {
  API,
  JSON_API_TYPE,
  RESOURCE_CACHE_TIMEOUT,
} from 'frontend-lmb/utils/constants';
import { handleResponse } from 'frontend-lmb/utils/handle-response';

export default class PersoonApiService extends Service {
  @service store;
  @service bestuursperioden;

  async getCurrentFractie(persoonId, bestuursperiodeId) {
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/personen/${persoonId}/bestuursperiode/${bestuursperiodeId}/current-fractie`
    );
    const jsonResponse = await handleResponse(response);

    if (!jsonResponse.fractie) {
      return null;
    }

    return (
      await this.store.query('fractie', {
        'filter[:uri:]': jsonResponse.fractie,
      })
    ).at(0);
  }

  async hasActiveMandatarissen(persoonId) {
    const currentPeriod =
      await this.bestuursperioden.getCurrentBestuursperiode();
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/personen/${persoonId}/has-active-mandates/${currentPeriod.id}`
    );
    const jsonResponse = await handleResponse(response);

    return jsonResponse.isTrue;
  }

  async getPersonMandateesWithMandate(persoonId, mandaatId) {
    const mandatees = await this.store.query('mandataris', {
      filter: {
        'is-bestuurlijke-alias-van': {
          ':id:': persoonId,
        },
        bekleedt: {
          ':id:': mandaatId,
        },
      },
    });
    return mandatees;
  }

  async endActiveMandates(persoonId, date) {
    const currentPeriod =
      await this.bestuursperioden.getCurrentBestuursperiode();
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/personen/${persoonId}/end-active-mandates`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': JSON_API_TYPE,
        },
        body: JSON.stringify({
          bestuursperiodeId: currentPeriod.id,
          date: date,
        }),
      }
    );
    await handleResponse(response);

    await timeout(RESOURCE_CACHE_TIMEOUT);
  }

  async putPersonInRightGraph(persoonId, bestuursorgaanID) {
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/personen/${persoonId}/put-person-in-right-graph/${bestuursorgaanID}`,
      {
        method: 'POST',
      }
    );
    await handleResponse(response);
  }
}
