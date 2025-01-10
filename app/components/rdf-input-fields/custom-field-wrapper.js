import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';

import { consume } from 'ember-provide-consume-context';
import { task } from 'ember-concurrency';

import { JSON_API_TYPE } from 'frontend-lmb/utils/constants';

export default class RdfInputFieldsCustomFieldWrapperComponent extends Component {
  @consume('on-form-update') onFormUpdate;
  @consume('form-definition') formDefinition;

  @tracked showModal;

  get title() {
    return this.args.field?.label;
  }

  moveField = task(async (direction) => {
    const result = await fetch(
      `/form-content/${this.formDefinition.id}/fields/move`,
      {
        method: 'POST',
        headers: {
          'Content-Type': JSON_API_TYPE,
        },
        body: JSON.stringify({
          fieldUri: this.args.field.uri.value,
          formUri: this.args.form.uri,
          direction,
        }),
      }
    );

    if (result.ok) {
      this.onFormUpdate();
    }
  });
}
