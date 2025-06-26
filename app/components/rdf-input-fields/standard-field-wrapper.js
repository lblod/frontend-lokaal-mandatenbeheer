import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import { consume } from 'ember-provide-consume-context';
import { validationsForFieldWithType } from '@lblod/submission-form-helpers';

import {
  ADRES_CUSTOM_DISPLAY_TYPE,
  PERSON_CUSTOM_DISPLAY_TYPE,
  PERSON_MULTI_CUSTOM_DISPLAY_TYPE,
} from 'frontend-lmb/utils/well-known-uris';

export default class RdfInputFieldsStandardFieldWrapperComponent extends Component {
  @consume('form-context') formContext;
  @consume('form-state') formState;

  @tracked showModal;
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
    return (
      this.formState?.clickedField?.uri?.value === this.args.field.uri.value
    );
  }

  get styleClassForMainContainer() {
    if (!this.formState?.canSelectField) {
      return '';
    }

    const classes = ['rdf-field'];

    if (this.isFieldSelected) {
      classes.push('rdf-field--selected');
    }

    return classes.join(' ');
  }

  @action
  interactedWithField() {
    this.hasErrors = this.errors.length;
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
