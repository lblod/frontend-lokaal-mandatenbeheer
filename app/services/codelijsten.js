import Service from '@ember/service';
import { API, STATUS_CODE } from 'frontend-lmb/utils/constants';

export default class CodelijstenService extends Service {
  async conceptHasImplementation(conceptId) {
    if (!conceptId) {
      return;
    }
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/codelijst/concept/${conceptId}/has-implementation`
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
}
