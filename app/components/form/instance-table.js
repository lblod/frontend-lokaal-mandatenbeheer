import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { inject as service } from '@ember/service';
import { JSON_API_TYPE } from 'frontend-lmb/utils/constants';

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

  @action
  async removeInstance(instance) {
    const result = await fetch(
      `/form-content/${this.formInfo.formDefinition.id}/instances/${instance.id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': JSON_API_TYPE,
        },
      }
    );

    if (!result.ok) {
      this.errorMessage =
        'Er ging iets mis bij het verwijderen van het formulier. Probeer het later opnieuw.';
      return;
    }
    if (this.args.onRemoveInstance) {
      this.args.onRemoveInstance(instance.id);
    }
  }

  async onInit() {
    const form = this.args.formDefinition;
    const id = form.id;
    const response = await fetch(`/form-content/${id}/instances`);
    if (!response.ok) {
      let error = new Error(response.statusText);
      error.status = response.status;
      throw error;
    }
    const { instances } = await response.json();
    this.formInfo = {
      instances: instances,
      formDefinition: form,
    };
  }
}
