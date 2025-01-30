import Route from '@ember/routing/route';

export default class FormInstancesRoute extends Route {
  queryParams = {
    filter: { refreshModel: true },
    page: { refreshModel: false },
    size: { refreshModel: false },
    sort: { refreshModel: true },
  };

  async model() {
    const formModel = this.modelFor('forms.form');

    return {
      formDefinition: formModel,
      headerLabels: await this.getHeaderLabels(formModel.id),
    };
  }

  async getHeaderLabels(formId) {
    const response = await fetch(
      `/form-content/instance-table/${formId}/headers`
    );

    if (!response.ok) {
      let error = new Error(response.statusText);
      error.status = response.status;
      throw error;
    }
    const { headers } = await response.json();

    return headers;
  }
}
