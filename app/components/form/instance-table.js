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

  @action
  async onInit() {
    const form = this.args.formDefinition;
    const id = form.id;
    const response = await fetch(
      `/form-content/${id}/instances?page[size]=${this.args.size}&page[number]=${this.args.page}`
    );
    if (!response.ok) {
      let error = new Error(response.statusText);
      error.status = response.status;
      throw error;
    }
    const { instances } = await response.json();
    instances.meta = instances.meta || {};
    instances.meta.count = parseInt(response.headers.get('X-Total-Count'), 10);
    instances.meta.pagination = {
      first: {
        number: 0,
      },
      self: {
        number: this.args.page,
        size: this.args.size,
      },
      last: {
        number: Math.floor(instances.meta.count / this.args.size),
      },
    };
    if (this.args.page && this.args.page > 0) {
      instances.meta.pagination.prev = {
        number: this.args.page - 1,
        size: this.args.size,
      };
    }
    if (this.args.page * this.args.size < instances.meta.count) {
      instances.meta.pagination.next = {
        number: this.args.page + 1,
        size: this.args.size,
      };
    }

    let headers = [];
    if (instances.length > 0) {
      headers = Object.keys(instances[0]);
    }

    this.formInfo = {
      instances: instances,
      formDefinition: form,
      headers: headers,
    };
  }
}
