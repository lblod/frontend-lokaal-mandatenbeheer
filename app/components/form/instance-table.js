import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { inject as service } from '@ember/service';

export default class InstanceTableComponent extends Component {
  @service store;

  @tracked formInfo = null;

  constructor() {
    super(...arguments);
    this.onInit();
  }

  get initialized() {
    return this.formInfo !== null;
  }

  get editRoute() {
    if (this.args.editRoute) {
      return this.args.editRoute;
    }
    return 'formbeheer.form.instance';
  }

  @action
  async removeInstance(instanceId) {
    const result = await fetch(
      `/form-content/${this.formInfo.form.definition.id}/instances/${instanceId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/vnd.api+json',
        },
      }
    );

    if (!result.ok) {
      this.errorMessage =
        'Er ging iets mis bij het verwijderen van het formulier. Probeer het later opnieuw.';
      return;
    }
    if (this.args.onRemoveInstance) {
      this.args.onRemoveInstance(instanceId);
    }
  }

  @action
  async onInit() {
    const form = this.args.form;
    const id = form.definition.id;
    const response = await fetch(`/form-content/${id}/instances`);
    if (!response.ok) {
      let error = new Error(response.statusText);
      error.status = response.status;
      throw error;
    }
    const { instances } = await response.json();
    this.formInfo = {
      instances: instances,
      form,
    };
  }
}
