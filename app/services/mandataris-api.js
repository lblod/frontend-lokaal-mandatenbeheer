import Service from '@ember/service';

import { service } from '@ember/service';
import { timeout } from 'ember-concurrency';
import {
  API,
  JSON_API_TYPE,
  RESOURCE_CACHE_TIMEOUT,
  STATUS_CODE,
} from 'frontend-lmb/utils/constants';
import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';

export default class MandatarisApiService extends Service {
  @service store;
  @service toaster;

  async copyOverNonDomainResourceProperties(oldMandatarisId, newMandatarisId) {
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/mandatarissen/${oldMandatarisId}/copy/${newMandatarisId}`,
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

  async bulkSetPublicationStatus(mandatarissen, status, decision) {
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/mandatarissen/bulk-set-publication-status`,
      {
        method: 'POST',
        headers: {
          'Content-Type': JSON_API_TYPE,
        },
        body: JSON.stringify({
          statusUri: status.uri,
          decision: decision,
          mandatarissen: mandatarissen,
        }),
      }
    );
    const jsonResponse = await response.json();

    if (response.status !== STATUS_CODE.OK) {
      console.error(jsonResponse.message);
      showErrorToast(
        this.toaster,
        'Er ging iets mis bij het updaten van de publicatiestatussen'
      );
    }
    showSuccessToast(
      this.toaster,
      `De publicatiestatussen werden succesvol geüpdatet naar "${status.label}"`
    );
  }

  async getMandatarisFracties(mandatarisId) {
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/mandatarissen/${mandatarisId}/fracties`
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

    return await this.store.query('fractie', {
      'filter[:id:]': jsonResponse.fracties.join(','),
      include: 'fractietype',
    });
  }

  getDownLoadUrl({
    bestuursperiodeId,
    bestuursorgaanId = null,
    activeOnly = false,
    persoonIds = null,
    fractieIds = null,
    hasFilterOnOnafhankelijkeFractie = false,
    hasFilterOnNietBeschikbareFractie = false,
    bestuursFunctieCodeIds = null,
    sort = null,
  }) {
    const queryParams = {
      bestuursperiodeId: bestuursperiodeId ?? null,
      bestuursorgaanId: bestuursorgaanId ?? null,
      activeOnly: activeOnly,
      hasFilterOnOnafhankelijkeFractie: hasFilterOnOnafhankelijkeFractie,
      hasFilterOnNietBeschikbareFractie: hasFilterOnNietBeschikbareFractie,
      sort: sort,
      persoonIds: persoonIds ? persoonIds.join(',') : null,
      fractieIds: fractieIds ? fractieIds.join(',') : null,
      bestuursFunctieCodeIds: bestuursFunctieCodeIds
        ? bestuursFunctieCodeIds.join(',')
        : null,
    };
    const createQueryParamsAsString = Object.keys(queryParams)
      .filter((key) => queryParams[key])
      .map((key) => `${key}=${queryParams[key]}`);

    return `${API.MANDATARIS_SERVICE}/mandatarissen/download?${createQueryParamsAsString.join('&')}`;
  }

  async generateRows(config) {
    const {
      count,
      mandaatUri,
      startDate,
      endDate,
      rangordeStartsAt,
      rangordeLabel,
    } = config;
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/mandatarissen/generate-rows`,
      {
        method: 'POST',
        headers: {
          'Content-Type': JSON_API_TYPE,
        },
        body: JSON.stringify({
          count,
          rangordeStartsAt,
          rangordeLabel,
          startDate,
          endDate,
          mandaatUri,
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
  }
}
