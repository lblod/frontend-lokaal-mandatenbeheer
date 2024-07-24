import { API } from 'frontend-lmb/utils/constants';

export default class MandatarisRepository {
  async isActive(mandatarisId) {
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/mandatarissen/${mandatarisId}/isActive`
    );
    const jsonReponse = await response.json();

    if (response.status !== 200) {
      console.error(jsonReponse.message);
      throw jsonReponse.message;
    }

    return jsonReponse.isActive;
  }

  async getBestuursperiode(mandatarisId) {
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/mandatarissen/${mandatarisId}/bestuursperiode`
    );
    const jsonReponse = await response.json();

    if (response.status !== 200) {
      console.error(jsonReponse.message);
      throw jsonReponse.message;
    }

    return {
      uri: jsonReponse.uri,
      id: jsonReponse.id,
    };
  }
}
