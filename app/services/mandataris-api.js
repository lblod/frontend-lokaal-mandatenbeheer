import Service from '@ember/service';

import { service } from '@ember/service';
import { timeout } from 'ember-concurrency';
import {
  API,
  JSON_API_TYPE,
  RESOURCE_CACHE_TIMEOUT,
  STATUS_CODE,
} from 'frontend-lmb/utils/constants';

export default class MandatarisApiService extends Service {
  @service store;

  async copyOverNonDomainResourceProperties(oldMandatarisId, newMandatarisId) {
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/mandatarissen/${oldMandatarisId}/copy/${newMandatarisId}`,
      {
        method: 'PUT',
      }
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
  }

  async findDecisionUri(mandatarisId) {
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/mandatarissen/${mandatarisId}/decision`
    );
    const jsonReponse = await response.json();

    if (response.status !== STATUS_CODE.OK) {
      console.error(jsonReponse.message);
      throw {
        status: response.status,
        message: jsonReponse.message,
      };
    }

    return jsonReponse.decisionUri;
  }

  async bulkEffectief(mandatarissen) {
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/mandatarissen/bulk-set-publication-status`,
      {
        method: 'POST',
        headers: {
          'Content-Type': JSON_API_TYPE,
        },
        body: JSON.stringify({
          status: 'effectief',
          mandatarissen: mandatarissen,
        }),
      }
    );
    const jsonReponse = await response.json();

    if (response.status !== STATUS_CODE.OK) {
      console.error(jsonReponse.message);
      throw {
        status: response.status,
        message: jsonReponse.message,
      };
    }
  }

  async bulkBekrachtig(mandatarissen, decision) {
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/mandatarissen/bulk-set-publication-status`,
      {
        method: 'POST',
        headers: {
          'Content-Type': JSON_API_TYPE,
        },
        body: JSON.stringify({
          status: 'bekrachtig',
          decision: decision,
          mandatarissen: mandatarissen,
        }),
      }
    );
    const jsonReponse = await response.json();

    if (response.status !== STATUS_CODE.OK) {
      console.error(jsonReponse.message);
      throw {
        status: response.status,
        message: jsonReponse.message,
      };
    }
  }

  async getMandatarisFracties(mandatarisId) {
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/mandatarissen/${mandatarisId}/fracties`
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
      include: 'fractietype',
    });
  }
}
