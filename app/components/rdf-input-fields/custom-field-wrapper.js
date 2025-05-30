import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import { consume } from 'ember-provide-consume-context';
import { task } from 'ember-concurrency';
import {
  validationsForFieldWithType,
  validationResultsForField,
} from '@lblod/submission-form-helpers';

import { JSON_API_TYPE } from 'frontend-lmb/utils/constants';
import {
  ADRES_CUSTOM_DISPLAY_TYPE,
  PERSON_CUSTOM_DISPLAY_TYPE,
  PERSON_MULTI_CUSTOM_DISPLAY_TYPE,
} from 'frontend-lmb/utils/well-known-uris';
import { isFieldShownInSummmary } from 'frontend-lmb/utils/form-properties';

export default class RdfInputFieldsCustomFieldWrapperComponent extends Component {
  @consume('form-context') formContext;
  @consume('form-state') formState;

  @tracked hasErrors;

  get title() {
    return this.args.field?.label;
  }

  get isFieldReadOnly() {
    return (
      this.formState?.isReadOnly &&
      ![
        ADRES_CUSTOM_DISPLAY_TYPE,
        PERSON_CUSTOM_DISPLAY_TYPE,
        PERSON_MULTI_CUSTOM_DISPLAY_TYPE,
      ].includes(this.args.field.displayType)
    );
  }

  get isFieldSelected() {
    return this.formState?.clickedField?.uri === this.args.field.uri.value;
  }

  get styleClassForMainContainer() {
    if (!this.formState?.canSelectField) {
      return '';
    }

    const classes = ['custom-form-field'];

    if (this.isFieldSelected) {
      classes.push('custom-form-field--selected');
    }

    return classes.join(' ');
  }

  get styleClassForContainerAroundField() {
    const base =
      'au-u-flex au-u-flex--between au-u-flex--vertical-start au-u-flex--spaced-tiny';

    if (this.hasErrors && this.args.showErrorLineNextToField) {
      return base + ' wrapped-field--error';
    }

    return base;
  }

  @action
  interactedWithField() {
    this.hasErrors = this.errors.length;
  }

  get errors() {
    return validationResultsForField(
      this.args.field.uri,
      this.storeOptions
    ).filter((result) => !result.valid);
  }

  @action
  passOnClickedField() {
    if (!this.formState?.canSelectField) {
      return;
    }

    let clickedField = null;
    if (this.formState.clickedField?.uri !== this.args.field.uri.value) {
      clickedField = this.args.field;
    }
    this.formContext.onFieldClicked(clickedField);
  }

  moveField = task(async (direction) => {
    const result = await fetch(
      `/form-content/${this.formContext.formDefinition.id}/fields/move`,
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
      this.formContext.onFormUpdate();
      this.formContext.onFieldClicked(null);
    }
  });

  get isFieldShownInSummary() {
    return isFieldShownInSummmary(
      this.storeOptions.store,
      this.args.field?.uri
    );
  }

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
