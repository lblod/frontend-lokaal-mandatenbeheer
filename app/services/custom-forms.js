import Service from '@ember/service';

import { service } from '@ember/service';

import { timeout } from 'ember-concurrency';

import {
  API,
  JSON_API_TYPE,
  RESOURCE_CACHE_TIMEOUT,
  STATUS_CODE,
} from 'frontend-lmb/utils/constants';
import { showErrorToast } from 'frontend-lmb/utils/toasts';

export default class CustomFormsService extends Service {
  @service toaster;

  async createEmptyDefinition(formName, description) {
    const response = await fetch(`${API.FORM_CONTENT_SERVICE}/definition/new`, {
      method: 'POST',
      headers: {
        'Content-Type': JSON_API_TYPE,
      },
      body: JSON.stringify({
        name: formName?.trim(),
        description: description?.trim(),
      }),
    });
    const jsonResponse = await response.json();

    if (response.status !== STATUS_CODE.CREATED) {
      console.error({ jsonResponse });
    }
    return jsonResponse.id;
  }

  async getFormDefinitionUsageCount(formDefinitionId) {
    const response = await fetch(
      `${API.FORM_CONTENT_SERVICE}/definition/${formDefinitionId}/usage-count`
    );
    const jsonResponse = await response.json();

    if (response.status !== STATUS_CODE.OK) {
      console.error({ jsonResponse });
    }

    return {
      hasUsage: jsonResponse.hasUsage,
      count: jsonResponse.count,
    };
  }

  async removeFormDefinitionWithUsage(form) {
    const response = await fetch(
      `${API.FORM_CONTENT_SERVICE}/definition/${form.id}/usage`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      const jsonResponse = await response.json();
      console.error({ jsonResponse });
    }
    await form.destroyRecord();
    await timeout(RESOURCE_CACHE_TIMEOUT);
  }

  async updateCustomFormField(
    formDefinitionId,
    fieldUri,
    { label, displayTypeUri, conceptSchemeUri, isRequired, isShownInSummary }
  ) {
    try {
      await fetch(`/form-content/${formDefinitionId}/fields`, {
        method: 'PUT',
        headers: {
          'Content-Type': JSON_API_TYPE,
        },
        body: JSON.stringify({
          field: fieldUri,
          displayType: displayTypeUri,
          name: label,
          isRequired: !!isRequired,
          showInSummary: !!isShownInSummary,
          conceptScheme: conceptSchemeUri,
        }),
      });

      return {
        uri: fieldUri,
        displayType: displayTypeUri,
        label,
        isRequired: !!isRequired,
        showInSummary: !!isShownInSummary,
        conceptScheme: conceptSchemeUri,
      };
    } catch (error) {
      showErrorToast(
        this.toaster,
        'Er ging iets mis bij het opslaan van het veld.'
      );
      return;
    }
  }

  async removeFormField(fieldUri, formUri) {
    try {
      await fetch(`/form-content/fields`, {
        method: 'DELETE',
        headers: {
          'Content-Type': JSON_API_TYPE,
        },
        body: JSON.stringify({
          fieldUri,
          formUri,
        }),
      });
    } catch (error) {
      showErrorToast(
        this.toaster,
        'Er ging iets mis bij het verwijderen van het veld.'
      );
      return;
    }
  }
}
