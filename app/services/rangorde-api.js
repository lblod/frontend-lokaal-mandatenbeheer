import Service from '@ember/service';

import { service } from '@ember/service';
import { API, JSON_API_TYPE, STATUS_CODE } from 'frontend-lmb/utils/constants';
import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';

export default class RangordeApiService extends Service {
  @service store;
  @service toaster;

  async updateRangordes(mandatarissen) {
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/rangorde/update-rangordes`,
      {
        method: 'POST',
        headers: {
          'Content-Type': JSON_API_TYPE,
        },
        body: JSON.stringify({
          mandatarissen: mandatarissen,
        }),
      }
    );
    const jsonReponse = await response.json();

    if (response.status !== STATUS_CODE.OK) {
      console.error(jsonReponse.message);
      showErrorToast(
        this.toaster,
        'Er ging iets mis bij het updaten van de rangordes'
      );
    }
    showSuccessToast(this.toaster, `De rangordes werden succesvol geüpdatet`);
  }
}
