export default class MandatarisRepository {
  PREFIX = '/mandataris-api';

  async isActive(mandatarisId) {
    const response = await fetch(
      `${this.PREFIX}/mandatarissen/${mandatarisId}/isActive`
    );
    const jsonReponse = await response.json();

    if (response.status !== 200) {
      console.error(jsonReponse.message);
      throw jsonReponse.message;
    }

    return jsonReponse.isActive;
  }
}
