import { API } from 'frontend-lmb/utils/constants';

export default class PersoonRepository {
  async findOnafhankelijkeFractie(persoonId) {
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/personen/${persoonId}/onafhankelijke-fractie`
    );
    const jsonReponse = await response.json();

    if (response.status !== 200) {
      console.error(jsonReponse.message);
      throw jsonReponse.message;
    }

    return jsonReponse.fractie;
  }

  async updateCurrentFractie(persoonId, bestuursperiodeId) {
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/personen/${persoonId}/current-fractie/${bestuursperiodeId}`,
      {
        method: 'PUT',
      }
    );
    const jsonReponse = await response.json();

    if (response.status !== 200) {
      console.error(jsonReponse.message);
      throw jsonReponse.message;
    }

    return jsonReponse.current;
  }
}
