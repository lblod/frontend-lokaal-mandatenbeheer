import Service from '@ember/service';

import { timeout } from 'ember-concurrency';

import {
  API,
  JSON_API_TYPE,
  RESOURCE_CACHE_TIMEOUT,
} from 'frontend-lmb/utils/constants';
import { handleResponse } from 'frontend-lmb/utils/handle-response';

export default class ConceptSchemeApiService extends Service {
  async conceptSchemeHasUsage(conceptSchemeId) {
    if (!conceptSchemeId) {
      return;
    }
    const response = await fetch(
      `${API.CONCEPT_SCHEME_SERVICE}/concept-scheme/${conceptSchemeId}/has-usage`
    );

    const jsonResponse = await handleResponse(
      response,
      'Er liep iets mis bij het nakijken of deze codelijst ergens in gebruik is.'
    );

    return {
      hasUsage: !!jsonResponse.hasUsage,
      uris: jsonResponse.uris ?? [],
      conceptUsageCount: jsonResponse.conceptUsageCount ?? 0,
    };
  }

  async deleteConceptSchemeAndTheirConcepts(conceptScheme) {
    if (!conceptScheme || !conceptScheme.id) {
      return;
    }
    const response = await fetch(
      `${API.CONCEPT_SCHEME_SERVICE}/concept-scheme/${conceptScheme.id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': JSON_API_TYPE,
        },
      }
    );
    await handleResponse(
      response,
      'Er liep iets mis bij het verwijderen van deze codelijst.'
    );
    await timeout(RESOURCE_CACHE_TIMEOUT);
  }

  async conceptHasUsage(conceptId) {
    if (!conceptId) {
      return;
    }
    const response = await fetch(
      `${API.CONCEPT_SCHEME_SERVICE}/concept/${conceptId}/has-usage`
    );

    const jsonResponse = await handleResponse(
      response,
      'Er liep iets mis bij het nakijken of deze concept ergens in gebruik is.'
    );

    return {
      hasUsage: !!jsonResponse.hasUsage,
      uris: jsonResponse.uris ?? [],
    };
  }

  async deleteConceptsAndUsage(concepts) {
    const conceptIdsToDelete = concepts
      .map((concept) => concept?.id)
      .filter((c) => c);
    if (conceptIdsToDelete.length === 0) {
      return;
    }

    const response = await fetch(
      `${API.CONCEPT_SCHEME_SERVICE}/concept/batch`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': JSON_API_TYPE,
        },
        body: JSON.stringify({
          ids: conceptIdsToDelete,
        }),
      }
    );

    await handleResponse(
      response,
      'Er liep iets mis bij het verwijderen van deze concepten en hun implementaties.'
    );

    await timeout(RESOURCE_CACHE_TIMEOUT);
  }
}
