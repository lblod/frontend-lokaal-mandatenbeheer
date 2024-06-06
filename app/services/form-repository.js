import Service from '@ember/service';

import { timeout } from 'ember-concurrency';
import {
  JSON_API_TYPE,
  RESOURCE_CACHE_TIMEOUT,
} from 'frontend-lmb/utils/constants';

export default class FormRepositoryService extends Service {
  async createFormInstance(instanceUri, definitionId, ttlCode) {
    const result = await fetch(`/form-content/${definitionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': JSON_API_TYPE,
      },
      body: JSON.stringify({
        contentTtl: ttlCode,
        instanceUri: instanceUri,
      }),
    });

    await timeout(RESOURCE_CACHE_TIMEOUT);

    return await this._handleCreateFetchhResult(result);
  }

  async updateFormInstance(
    instanceId,
    instanceUri,
    definitionId,
    ttlCode,
    description
  ) {
    const result = await fetch(
      `/form-content/${definitionId}/instances/${instanceId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': JSON_API_TYPE,
        },
        body: JSON.stringify({
          contentTtl: ttlCode,
          instanceUri: instanceUri,
          description: description,
        }),
      }
    );

    await timeout(RESOURCE_CACHE_TIMEOUT);

    return await this._handleUpdateFetchhResult(result);
  }

  async _handleCreateFetchhResult(result) {
    if (!result.ok) {
      return {
        id: null,
        errorMessage:
          'Er ging iets mis bij het opslaan van het formulier. Probeer het later opnieuw.',
      };
    }

    const { id } = await result.json();

    if (!id) {
      return {
        id: null,
        errorMessage:
          'Het formulier werd niet correct opgeslagen. Probeer het later opnieuw.',
      };
    }

    return {
      id: id,
      errorMessage: null,
    };
  }

  async _handleUpdateFetchhResult(result) {
    if (!result.ok) {
      return {
        body: null,
        errorMessage:
          'Er ging iets mis bij het opslaan van het formulier. Probeer het later opnieuw.',
      };
    }

    const body = await result.json();

    if (!body?.instance?.instanceUri) {
      return {
        body: null,
        errorMessage:
          'Het formulier werd niet correct opgeslagen. Probeer het later opnieuw.',
      };
    }

    return {
      body: body,
      errorMessage: null,
    };
  }
}
