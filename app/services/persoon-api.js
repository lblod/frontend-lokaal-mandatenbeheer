import Service from '@ember/service';

import { service } from '@ember/service';

import { timeout } from 'ember-concurrency';

import {
  API,
  JSON_API_TYPE,
  RESOURCE_CACHE_TIMEOUT,
  STATUS_CODE,
} from 'frontend-lmb/utils/constants';

export default class PersoonApiService extends Service {
  @service store;
  @service bestuursperioden;

  async getCurrentFractie(persoonId, bestuursperiodeId) {
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/personen/${persoonId}/bestuursperiode/${bestuursperiodeId}/current-fractie`
    );
    const jsonResponse = await response.json();

    if (response.status !== STATUS_CODE.OK) {
      console.error(jsonResponse.message);
      throw {
        status: response.status,
        message: jsonResponse.message,
      };
    }

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
    const jsonResponse = await response.json();

    if (response.status !== STATUS_CODE.OK) {
      console.error(jsonResponse.message);
      throw {
        status: response.status,
        message: jsonResponse.message,
      };
    }

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
    const jsonResponse = await response.json();

    if (response.status !== STATUS_CODE.OK) {
      console.error(jsonResponse.message);
      throw {
        status: response.status,
        message: jsonResponse.message,
      };
    }

    await timeout(RESOURCE_CACHE_TIMEOUT);
  }

  async putPersonInRightGraph(persoonId, bestuursorgaanID) {
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/personen/${persoonId}/put-person-in-right-graph/${bestuursorgaanID}`,
      {
        method: 'POST',
      }
    );
    const jsonResponse = await response.json();

    if (response.status !== STATUS_CODE.OK) {
      let error = new Error(jsonResponse.message);
      error.status = response.status;
      throw error;
    }
  }
}
