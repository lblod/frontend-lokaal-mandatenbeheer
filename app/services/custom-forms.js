import Service from '@ember/service';
import { API, JSON_API_TYPE, STATUS_CODE } from 'frontend-lmb/utils/constants';

export default class CustomFormsService extends Service {
  async createCustomFormType(typeName) {
    const response = await fetch(
      `${API.FORM_CONTENT_SERVICE}/custom-form-type/create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': JSON_API_TYPE,
        },
        body: JSON.stringify({
          name: typeName?.trim(),
        }),
      }
    );
    const jsonResponse = await response.json();

    if (response.status !== STATUS_CODE.CREATED) {
      console.error({ jsonResponse });
    }
    return {
      id: jsonResponse.id,
    };
  }

  async getInstanceTypeList() {
    const response = await fetch(
      `${API.FORM_CONTENT_SERVICE}/custom-form-type/list`,
      {
        method: 'GET',
        headers: {
          'Content-Type': JSON_API_TYPE,
        },
      }
    );
    const jsonResponse = await response.json();

    if (response.status !== STATUS_CODE.OK) {
      console.error({ jsonResponse });
    }

    console.log(`instances types`, jsonResponse.types);
    return jsonResponse.types;
  }

  async createCustomForm(formName, typeId) {
    const response = await fetch(
      `${API.FORM_CONTENT_SERVICE}/custom-form-instance/create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': JSON_API_TYPE,
        },
        body: JSON.stringify({
          name: formName?.trim(),
          typeId: typeId,
        }),
      }
    );
    const jsonResponse = await response.json();

    if (response.status !== STATUS_CODE.CREATED) {
      console.error({ jsonResponse });
    }
    console.log(`created form`, jsonResponse);
  }

  async getInstanceList() {
    const response = await fetch(
      `${API.FORM_CONTENT_SERVICE}/custom-form-instance/list`,
      {
        method: 'GET',
        headers: {
          'Content-Type': JSON_API_TYPE,
        },
      }
    );
    const jsonResponse = await response.json();

    if (response.status !== STATUS_CODE.OK) {
      console.error({ jsonResponse });
    }

    console.log(`instances`, jsonResponse.instances);

    return jsonResponse.instances;
  }
}
