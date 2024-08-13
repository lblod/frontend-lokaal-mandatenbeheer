import Service from '@ember/service';

import { service } from '@ember/service';
import { timeout } from 'ember-concurrency';

import {
  API,
  RESOURCE_CACHE_TIMEOUT,
  STATUS_CODE,
} from 'frontend-lmb/utils/constants';
import {
  FRACTIETYPE_ONAFHANKELIJK,
  FRACTIETYPE_SAMENWERKINGSVERBAND,
} from 'frontend-lmb/utils/well-known-uris';

export default class FractieApiService extends Service {
  @service store;

  async forBestuursperiode(bestuursperiodeId) {
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/fracties/${bestuursperiodeId}/bestuursperiode`
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
      'filter[fractietype][:uri:]': FRACTIETYPE_SAMENWERKINGSVERBAND,
    });

    return fracties.filter((f) => f);
  }

  async onafhankelijkeForBestuursperiode(bestuursperiodeId) {
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/fracties/${bestuursperiodeId}/bestuursperiode`
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
      'filter[fractietype][:uri:]': FRACTIETYPE_ONAFHANKELIJK,
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
