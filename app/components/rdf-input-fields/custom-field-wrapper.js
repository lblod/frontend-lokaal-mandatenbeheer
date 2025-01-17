import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';

import { consume } from 'ember-provide-consume-context';
import { task } from 'ember-concurrency';
import { validationsForFieldWithType } from '@lblod/submission-form-helpers';

import { JSON_API_TYPE } from 'frontend-lmb/utils/constants';
import { ADRES_CUSTOM_DISPLAY_TYPE } from 'frontend-lmb/utils/well-known-uris';

export default class RdfInputFieldsCustomFieldWrapperComponent extends Component {
  @consume('on-form-update') onFormUpdate;
  @consume('form-definition') formDefinition;
  @consume('is-read-only') isReadOnly;

  @tracked showModal;

  get title() {
    return this.args.field?.label;
  }

  get isFieldReadOnly() {
    return (
      this.isReadOnly &&
      ![ADRES_CUSTOM_DISPLAY_TYPE].includes(this.args.field.displayType)
    );
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

  // From ember-submission-form-fields component: input-field.js
  // We cannot access these properties as they are in the component itself and this is just a wrapper
  get isRequired() {
    return (
      !this.args.show &&
      this.constraints.some(
        (constraint) =>
          constraint.type.value ===
          'http://lblod.data.gift/vocabularies/forms/RequiredConstraint'
      )
    );
  }

  get constraints() {
    return validationsForFieldWithType(this.args.field.uri, this.storeOptions);
  }

  get storeOptions() {
    return {
      formGraph: this.args.graphs.formGraph,
      sourceGraph: this.args.graphs.sourceGraph,
      metaGraph: this.args.graphs.metaGraph,
      sourceNode: this.args.sourceNode,
      store: this.args.formStore,
      path: this.args.field.rdflibPath,
      scope: this.args.field.rdflibScope,
    };
  }
}
