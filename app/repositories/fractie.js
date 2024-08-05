import { API, STATUS_CODE } from 'frontend-lmb/utils/constants';

export const fractieRepository = {
  createOnafhankelijkeFractie,
  isMandatarisFractieOnafhankelijk,
  getAllUrisForPerson,
};

async function createOnafhankelijkeFractie(
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

  if (response.status !== STATUS_CODE.CREATED) {
    throw new Error(jsonReponse.message);
  }

  return jsonReponse.uri;
}

// Could be a call to the mandataris service*
async function isMandatarisFractieOnafhankelijk(mandatarisModel) {
  const lid = await mandatarisModel.heeftLidmaatschap;
  if (!lid) {
    return true;
  }

  const fractie = await lid.binnenFractie;
  if (fractie) {
    const type = await fractie.fractietype;
    return type ? type.isOnafhankelijk : false;
  }

  return false;
}

async function getAllUrisForPerson(persoonId, mandaatUri) {
  const response = await fetch(
    `${API.MANDATARIS_SERVICE}/fracties/${persoonId}/persoon`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mandaatUri: mandaatUri,
      }),
    }
  );

  const jsonReponse = await response.json();

  if (response.status !== STATUS_CODE.OK) {
    throw new Error(jsonReponse.message);
  }

  return jsonReponse.fractieUris;
}
