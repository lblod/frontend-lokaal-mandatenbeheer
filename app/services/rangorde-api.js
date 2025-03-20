import Service from '@ember/service';

import { service } from '@ember/service';
import { API, JSON_API_TYPE } from 'frontend-lmb/utils/constants';
import { endOfDay } from 'frontend-lmb/utils/date-manipulation';
import { handleResponse } from 'frontend-lmb/utils/handle-response';

export default class RangordeApiService extends Service {
  @service store;
  @service toaster;

  async updateRangordes(mandatarissen, asCorrection, date) {
    const realDate = endOfDay(date);
    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/rangorde/update-rangordes?asCorrection=${asCorrection}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': JSON_API_TYPE,
        },
        body: JSON.stringify({
          mandatarissen: mandatarissen,
          date: realDate,
        }),
      }
    );
    await handleResponse({
      response,
      toaster: this.toaster,
      errorMessage: 'Er ging iets mis bij het updaten van de rangordes',
      successMessage: 'De rangordes werden succesvol geüpdatet',
    });
  }
}
