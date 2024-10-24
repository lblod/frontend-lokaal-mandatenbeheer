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
import { downloadTextAsFile } from 'frontend-lmb/utils/download-text-as-file';

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

  async bulkSetPublicationStatus(mandatarissen, status, decision) {
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/mandatarissen/bulk-set-publication-status`,
      {
        method: 'POST',
        headers: {
          'Content-Type': JSON_API_TYPE,
        },
        body: JSON.stringify({
          status: status,
          decision: decision,
          mandatarissen: mandatarissen,
        }),
      }
    );
    const jsonReponse = await response.json();

    if (response.status !== STATUS_CODE.OK) {
      console.error(jsonReponse.message);
      showErrorToast(
        this.toaster,
        'Er ging iets mis bij het updaten van de publicatiestatussen'
      );
    }
    showSuccessToast(
      this.toaster,
      `De publicatiestatussen werden succesvol geüpdatet naar ${status}`
    );
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

  async downloadAsCsv({
    bestuursperiodeId,
    bestuursorgaanId = null,
    activeOnly = false,
    sort = null,
  }) {
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/mandatarissen/download`,
      {
        method: 'POST',
        headers: {
          'Content-Type': JSON_API_TYPE,
        },
        body: JSON.stringify({
          bestuursperiodeId: bestuursperiodeId,
          bestuursorgaanId: bestuursorgaanId,
          onlyShowActive: activeOnly,
          sort,
        }),
      }
    );

    const jsonReponse = await response.json();

    if (response.status !== STATUS_CODE.OK) {
      console.error(jsonReponse);
      throw {
        status: response.status,
        message: jsonReponse.message,
      };
    }

    downloadTextAsFile(
      {
        filename: 'mandataris_export.csv',
        contentAsText: atob(jsonReponse.data ?? ''),
      },
      document,
      window
    );
  }
}
