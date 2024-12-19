import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { JSON_API_TYPE } from 'frontend-lmb/utils/constants';

export default class GenerateCustomFieldButtonComponent extends Component {
  @service formReplacements;
  @tracked showModal = false;
  @tracked loading = false;
  @tracked fieldName = '';

  get invalidName() {
    return !this.fieldName || this.fieldName.trim().length < 1;
  }

  get disabled() {
    return this.invalidName;
  }

  @action
  async onAddField() {
    this.showModal = true;
    this.fieldName = '';
  }

  @action
  closeModal() {
    this.showModal = false;
  }

  @action async onSaveField() {
    this.loading = true;
    const result = await fetch(`/form-content/${this.args.form.id}/fields`, {
      method: 'POST',
      headers: {
        'Content-Type': JSON_API_TYPE,
      },
      body: JSON.stringify({
        displayType:
          'http://lblod.data.gift/display-types/lmb/custom-string-input',
        order: 9000,
        name: this.fieldName,
      }),
    });

    const body = await result.json();
    const newFormId = body.id;
    this.formReplacements.setReplacement(this.args.form.id, newFormId);
    if (this.args.onUpdate) {
      this.args.onUpdate();
    }
    this.loading = false;
    this.showModal = false;
  }

  @action updateName(event) {
    this.fieldName = event.target.value;
  }
}
