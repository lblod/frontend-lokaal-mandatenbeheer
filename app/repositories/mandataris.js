import { API, STATUS_CODE } from 'frontend-lmb/utils/constants';

export const mandatarisRepository = {
  isActive,
  updateCurrentFractieForPerson,
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

async function updateCurrentFractieForPerson(mandatarisId) {
  const response = await fetch(
    `${API.MANDATARIS_SERVICE}/mandatarissen/${mandatarisId}/current-fractie`,
    {
      method: 'PUT',
    }
  );
  const jsonReponse = await response.json();

  if (response.status !== STATUS_CODE.OK) {
    console.error(jsonReponse.message);
    throw jsonReponse.message;
  }

  return jsonReponse.current;
}

async function getBestuursperiode(mandatarisModel) {
  const mandaat = await mandatarisModel.bekleedt;
  const bestuursorganenInTijd = await mandaat.bevatIn;
  const first = bestuursorganenInTijd[0];

  return await first.heeftBestuursperiode;
}
