import Service from '@ember/service';

import { service } from '@ember/service';

import { timeout } from 'ember-concurrency';

import {
  API,
  RESOURCE_CACHE_TIMEOUT,
  STATUS_CODE,
} from 'frontend-lmb/utils/constants';

export default class PersoonApiService extends Service {
  @service store;

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
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/personen/${persoonId}/has-active-mandates`
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

  async endActiveMandates(persoonId) {
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/personen/${persoonId}/end-active-mandates`,
      {
        method: 'PUT',
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
