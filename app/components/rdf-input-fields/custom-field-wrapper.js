import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { JSON_API_TYPE } from 'frontend-lmb/utils/constants';

import { consume } from 'ember-provide-consume-context';
import { task } from 'ember-concurrency';
import { showSuccessToast } from 'frontend-lmb/utils/toasts';

export default class RdfInputFieldsCustomFieldWrapperComponent extends Component {
  @service toaster;
  @service formReplacements;
  @consume('on-form-update') onUpdate;

  @tracked removing = false;
  @tracked showEditFieldModal;

  // Field properties
  @tracked name;
  @tracked type;
  @tracked order;

  get title() {
    return this.args.field?.label;
  }

  get canSaveChanges() {
    return this.name && this.type && this.order;
  }

  @action
  async onRemove() {
    this.removing = true;
    await fetch(`/form-content/fields`, {
      method: 'DELETE',
      headers: {
        'Content-Type': JSON_API_TYPE,
      },
      body: JSON.stringify({
        fieldUri: this.args.field.uri.value,
        formUri: this.args.form.uri,
      }),
    });
    this.onUpdate();
    this.removed = true;
  }

  @action
  closeEditFieldModal() {
    this.showEditFieldModal = false;
  }

  @action
  updateField(event) {
    const { name, value } = event.target;
    this[name] = value;
  }

  saveChanges = task(async () => {
    // TODO:
    this.showEditFieldModal = false;
    showSuccessToast(this.toaster, 'Het veld werd succesvol aangepast.');
  });
}
