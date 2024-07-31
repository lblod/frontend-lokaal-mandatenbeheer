import Service from '@ember/service';

import { service } from '@ember/service';

import { API, STATUS_CODE } from 'frontend-lmb/utils/constants';

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

    return await this.store.query('fractie', {
      'filter[:id:]': jsonReponse.fracties.join(','),
    });
  }
}
