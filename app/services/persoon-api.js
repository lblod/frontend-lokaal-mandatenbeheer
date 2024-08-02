import Service from '@ember/service';

import { service } from '@ember/service';

import { API, STATUS_CODE } from 'frontend-lmb/utils/constants';

export default class PersoonApiService extends Service {
  @service store;

  async getMandatarisFracties(persoonId, bestuursperiodeId) {
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/personen/${persoonId}/bestuursperiode/${bestuursperiodeId}/fracties`
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

    return await this.store.query('fractie', {
      'filter[:id:]': jsonReponse.fracties.join(','),
    });
  }

  async getCurrentFractie(persoonId, bestuursperiodeId) {
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/personen/${persoonId}/bestuursperiode/${bestuursperiodeId}/current-fractie`
    );
    const jsonReponse = await response.json();

    if (response.status !== STATUS_CODE.OK) {
      console.error(jsonReponse.message);
      throw {
        status: response.status,
        message: jsonReponse.message,
      };
    }

    if (!jsonReponse.fractie) {
      return null;
    }

    return (
      await this.store.query('fractie', {
        'filter[:uri:]': jsonReponse.fractie,
      })
    ).at(0);
  }
}
