import Service from '@ember/service';

import { service } from '@ember/service';
import { timeout } from 'ember-concurrency';

import { API, RESOURCE_CACHE_TIMEOUT } from 'frontend-lmb/utils/constants';
import { handleResponse } from 'frontend-lmb/utils/handle-response';

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
    const jsonResponse = await handleResponse({ response });

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
      { method: 'PUT' }
    );
    await handleResponse({ response });
    if (!noTimeout) {
      await timeout(RESOURCE_CACHE_TIMEOUT);
    }
  }

  async removeFractieWhenNoLidmaatschap(bestuursperiodeId, noTimeout = false) {
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/fracties/cleanup/bestuursperiode/${bestuursperiodeId}`,
      { method: 'DELETE' }
    );
    const jsonResponse = await handleResponse({ response });
    if (!noTimeout) {
      await timeout(RESOURCE_CACHE_TIMEOUT);
    }
    console.info(
      `Removed ${jsonResponse.fracties.length} dangling fractie(s).`
    );
  }
}
