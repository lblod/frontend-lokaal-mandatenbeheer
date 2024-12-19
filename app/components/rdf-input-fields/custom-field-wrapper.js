import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { JSON_API_TYPE } from 'frontend-lmb/utils/constants';
import { consume } from 'ember-provide-consume-context';

export default class RdfInputFieldsCustomFieldWrapperComponent extends Component {
  @service formReplacements;
  @consume('on-form-update') onUpdate;

  @tracked removing = false;
  get title() {
    return this.args.field?.label;
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
}
