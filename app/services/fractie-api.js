import Service from '@ember/service';

import { service } from '@ember/service';
import { timeout } from 'ember-concurrency';

import {
  API,
  JSON_API_TYPE,
  RESOURCE_CACHE_TIMEOUT,
  STATUS_CODE,
} from 'frontend-lmb/utils/constants';

export default class FractieApiService extends Service {
  @service store;

  async samenwerkingForBestuursperiode(bestuursperiodeId) {
    return await this.forBestuursperiode(bestuursperiodeId, false);
  }

  async onafhankelijkForBestuursperiode(bestuursperiodeId) {
    return await this.forBestuursperiode(bestuursperiodeId, true);
  }

  async forBestuursperiode(bestuursperiodeId, onafhankelijk) {
    const type = onafhankelijk ? 'onafhankelijk' : 'samenwerking';
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/fracties/${type}/${bestuursperiodeId}/bestuursperiode`
    );
    const jsonResponse = await response.json();

    if (response.status !== STATUS_CODE.OK) {
      console.error(jsonResponse.message);
      throw {
        status: response.status,
        message: jsonResponse.message,
      };
    }

    if (jsonResponse.fracties.length === 0) {
      return [];
    }

    const fracties = await this.store.query('fractie', {
      'filter[:id:]': jsonResponse.fracties.join(','),
    });

    return fracties.filter((f) => f);
  }

  async updateCurrentFractie(mandatarisId, noTimeout = false) {
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/fracties/${mandatarisId}/current-fractie`,
      { method: 'POST' }
    );

    if (response.status !== STATUS_CODE.OK) {
      const jsonResponse = await response.json();
      console.error(jsonResponse.message);
      throw {
        status: response.status,
        message: jsonResponse.message,
      };
    }
    if (!noTimeout) {
      await timeout(RESOURCE_CACHE_TIMEOUT);
    }
  }

  async removeFractieWhenNoLidmaatschap(bestuursperiodeId, noTimeout = false) {
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/fracties/cleanup/bestuursperiode/${bestuursperiodeId}`,
      { method: 'DELETE' }
    );
    const jsonResponse = await response.json();

    if (response.status !== STATUS_CODE.OK) {
      console.error(jsonResponse.message);
      throw {
        status: response.status,
        message: jsonResponse.message,
      };
    }

    if (!noTimeout) {
      await timeout(RESOURCE_CACHE_TIMEOUT);
    }
    console.info(
      `Removed ${jsonResponse.fracties.length} dangling fractie(s).`
    );
  }

  async createReplacement(fractieId, label, endDate) {
    if (!fractieId || !endDate) {
      throw new Error('Fractie id of startdatum is niet meegegeven');
    }

    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/fracties/${fractieId}/create-replacement`,
      {
        method: 'POST',
        headers: {
          'Content-Type': JSON_API_TYPE,
        },
        body: JSON.stringify({
          label,
          endDate,
        }),
      }
    );

    if (response.status !== STATUS_CODE.CREATED) {
      const jsonResponse = await response.json();
      console.error(jsonResponse.message);
      throw {
        status: response.status,
        message: jsonResponse.message,
      };
    }
  }
}
