import { API } from 'frontend-lmb/utils/constants';

export default class FractieRepository {
  async createOnafhankelijkeFractie(
    bestuursorganenInTijdUris,
    bestuurseenheidUri
  ) {
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/fracties/onafhankelijke-fractie`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bestuurseenheidUri: bestuurseenheidUri,
          bestuursorgaanUrisInTijd: bestuursorganenInTijdUris,
        }),
      }
    );

    const jsonReponse = await response.json();

    if (response.status !== 201) {
      throw new Error(jsonReponse.message);
    }

    return jsonReponse.uri;
  }
}
