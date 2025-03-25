import Service from '@ember/service';
import { API, JSON_API_TYPE, STATUS_CODE } from 'frontend-lmb/utils/constants';

export default class CustomFormsService extends Service {
  async createEmptyDefinition(formName) {
    const response = await fetch(`${API.FORM_CONTENT_SERVICE}/definition/new`, {
      method: 'POST',
      headers: {
        'Content-Type': JSON_API_TYPE,
      },
      body: JSON.stringify({
        name: formName?.trim(),
      }),
    });
    const jsonResponse = await response.json();

    if (response.status !== STATUS_CODE.CREATED) {
      console.error({ jsonResponse });
    }
    console.log(`created form`, jsonResponse);
    return jsonResponse.id;
  }
}
