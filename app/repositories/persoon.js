import { BASE_API_URL } from 'frontend-lmb/utils/constants';

export default class PersoonRepository {
  async findOnafhankelijkeFractie(persoonId) {
    const response = await fetch(
      `${BASE_API_URL}/personen/${persoonId}/onafhankelijke-fractie`
    );
    const jsonReponse = await response.json();

    if (response.status !== 200) {
      console.error(jsonReponse.message);
      throw jsonReponse.message;
    }

    return jsonReponse.fractie;
  }
}
