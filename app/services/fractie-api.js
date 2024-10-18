import Service from '@ember/service';

import { service } from '@ember/service';
import { timeout } from 'ember-concurrency';

import {
  API,
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
    const jsonReponse = await response.json();

    if (response.status !== STATUS_CODE.OK) {
      console.error(jsonReponse.message);
      throw {
        status: response.status,
        message: jsonReponse.message,
      };
    }

    if (jsonReponse.fracties.length === 0) {
      return [];
    }

    const fracties = await this.store.query('fractie', {
      'filter[:id:]': jsonReponse.fracties.join(','),
    });

    return fracties.filter((f) => f);
  }

  async updateCurrentFractie(mandatarisId) {
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/fracties/${mandatarisId}/current-fractie`,
      { method: 'PUT' }
    );

    if (response.status !== STATUS_CODE.OK) {
      const jsonReponse = await response.json();
      console.error(jsonReponse.message);
      throw {
        status: response.status,
        message: jsonReponse.message,
      };
    }

    await timeout(RESOURCE_CACHE_TIMEOUT);
  }

  async removeFractieWhenNoLidmaatschap(bestuursperiodeId) {
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/fracties/cleanup/bestuursperiode/${bestuursperiodeId}`,
      { method: 'DELETE' }
    );
    const jsonReponse = await response.json();

    if (response.status !== STATUS_CODE.OK) {
      console.error(jsonReponse.message);
      throw {
        status: response.status,
        message: jsonReponse.message,
      };
    }

    await timeout(RESOURCE_CACHE_TIMEOUT);
    console.info(`Removed ${jsonReponse.fracties.length} dangling fractie(s).`);
  }
}
