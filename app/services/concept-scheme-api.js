import Service from '@ember/service';
import { API, JSON_API_TYPE, STATUS_CODE } from 'frontend-lmb/utils/constants';

export default class ConceptSchemeApiService extends Service {
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

  async deleteConceptsTheirImplementation(concepts) {
    const response = await fetch(`${API.CONCEPT_SCHEME_SERVICE}/concept/ids`, {
      method: 'DELETE',
      headers: {
        'Content-Type': JSON_API_TYPE,
      },
      body: JSON.stringify({
        ids: concepts.map((concept) => concept.id),
      }),
    });

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
}
