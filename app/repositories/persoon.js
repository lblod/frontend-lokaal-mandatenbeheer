import { API, STATUS_CODE } from 'frontend-lmb/utils/constants';

export const persoonRepository = {
  findOnafhankelijkeFractie,
};

async function findOnafhankelijkeFractie(persoonId, bestuursperiodeId) {
  const response = await fetch(
    `${API.MANDATARIS_SERVICE}/personen/${persoonId}/onafhankelijke-fractie/${bestuursperiodeId}`
  );
  const jsonReponse = await response.json();

  if (response.status !== STATUS_CODE.OK) {
    console.error(jsonReponse.message);
    throw jsonReponse.message;
  }

  return jsonReponse.fractie;
}
