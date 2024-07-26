import { API, STATUS_CODE } from 'frontend-lmb/utils/constants';

export const mandatarisRepository = {
  isActive,
  getBestuursperiode,
};

async function isActive(mandatarisId) {
  const response = await fetch(
    `${API.MANDATARIS_SERVICE}/mandatarissen/${mandatarisId}/isActive`
  );
  const jsonReponse = await response.json();

  if (response.status !== STATUS_CODE.OK) {
    console.error(jsonReponse.message);
    throw jsonReponse.message;
  }

  return jsonReponse.isActive;
}

async function getBestuursperiode(mandatarisId) {
  const response = await fetch(
    `${API.MANDATARIS_SERVICE}/mandatarissen/${mandatarisId}/bestuursperiode`
  );
  const jsonReponse = await response.json();

  if (response.status !== STATUS_CODE.OK) {
    console.error(jsonReponse.message);
    throw jsonReponse.message;
  }

  return {
    uri: jsonReponse.uri,
    id: jsonReponse.id,
  };
}
