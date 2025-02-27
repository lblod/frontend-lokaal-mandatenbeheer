import Service from '@ember/service';

import { API, JSON_API_TYPE, STATUS_CODE } from 'frontend-lmb/utils/constants';

export default class ConceptSchemeApiService extends Service {
  async conceptSchemeHasImplementations(conceptSchemeId) {
    if (!conceptSchemeId) {
      return;
    }
    const response = await fetch(
      `${API.CONCEPT_SCHEME_SERVICE}/concept-scheme/${conceptSchemeId}/has-implementations`
    );

    const jsonResponse = await response.json();

    if (response.status !== STATUS_CODE.OK) {
      console.error(jsonResponse.message);
      throw {
        status: response.status,
        message: jsonResponse.message,
      };
    }

    return jsonResponse;
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
    if (response.status !== STATUS_CODE.NO_CONTENT) {
      const jsonResponse = await response.json();
      console.error(jsonResponse.message);
      throw {
        status: response.status,
        message: jsonResponse.message,
      };
    }
  }

  async conceptHasImplementations(conceptId) {
    if (!conceptId) {
      return;
    }
    const response = await fetch(
      `${API.CONCEPT_SCHEME_SERVICE}/concept/${conceptId}/has-implementations`
    );

    const jsonResponse = await response.json();

    if (response.status !== STATUS_CODE.OK) {
      console.error(jsonResponse.message);
      throw {
        status: response.status,
        message: jsonResponse.message,
      };
    }

    return jsonResponse;
  }

  async deleteConceptsAndTheirImplementations(concepts) {
    const response = await fetch(`${API.CONCEPT_SCHEME_SERVICE}/concept/ids`, {
      method: 'DELETE',
      headers: {
        'Content-Type': JSON_API_TYPE,
      },
      body: JSON.stringify({
        ids: concepts.map((concept) => concept.id),
      }),
    });

    if (response.status !== STATUS_CODE.NO_CONTENT) {
      const jsonResponse = await response.json();
      console.error(jsonResponse.message);
      throw {
        status: response.status,
        message: jsonResponse.message,
      };
    }
  }
}
