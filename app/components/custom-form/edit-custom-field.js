import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked, cached } from '@glimmer/tracking';

import { trackedFunction } from 'reactiveweb/function';
import { use } from 'ember-resources';

import { LINK_TO_FORM_CUSTOM_DISPLAY_TYPE } from 'frontend-lmb/utils/well-known-uris';
import { isCustomDisplayType } from 'frontend-lmb/models/display-type';

export default class CustomFormEditCustomField extends Component {
  @use(setSelectedField) setSelectedField;
  @use(getDisplayTypes) getDisplayTypes;
  @use(getConceptSchemes) getConceptSchemes;

  @service store;
  @service customForms;

  @tracked label;
  @tracked displayType;
  @tracked conceptScheme;
  @tracked linkedFormTypeUri;
  @tracked isRequired;
  @tracked isShownInSummary;

  @tracked isSaving;
  @tracked isDeleteWarningShown;
  @tracked isDeleting;

  get fields() {
    return this.getFieldsForForm?.value || [];
  }

  get isStandardField() {
    return !isCustomDisplayType(this.args.selectedField?.displayType);
  }

  @cached
  get displayTypes() {
    return this.getDisplayTypes?.value || [];
  }

  @cached
  get conceptSchemes() {
    return this.getConceptSchemes?.value || [];
  }

  get selectedField() {
    return this.setSelectedField?.value;
  }

  get isValidLabel() {
    return this.label?.trim() !== '';
  }

  get isShowInSummaryToggleDisabled() {
    return (
      !this.selectedField ||
      this.selectedField.displayType === LINK_TO_FORM_CUSTOM_DISPLAY_TYPE ||
      this.displayType?.isLinkToForm
    );
  }

  get isLinkFormTypeSelected() {
    if (!this.displayType?.isLinkToForm) {
      return true;
    }

    return this.linkedFormTypeUri;
  }

  get canSaveChanges() {
    return (
      this.isChanged &&
      this.isValidLabel &&
      this.displayType &&
      this.isLinkFormTypeSelected
    );
  }

  get isChanged() {
    if (!this.selectedField) {
      return false;
    }

    return (
      this.selectedField.label !== this.label ||
      this.selectedField.displayType !== this.displayType?.uri ||
      this.selectedField.conceptScheme !== this.conceptScheme?.uri ||
      this.selectedField.isRequired !== this.isRequired ||
      this.selectedField.isShownInSummary !== this.isShownInSummary ||
      this.selectedField.linkedFormTypeUri !== this.linkedFormTypeUri
    );
  }

  @action
  updateSelectedField(field) {
    this.label = field?.label;
    this.isRequired = !!field?.isRequired;
    this.isShownInSummary = !!field?.isShownInSummary;
    this.linkedFormTypeUri = field?.linkedFormTypeUri;
    this.displayType = this.displayTypes.filter(
      (t) => t.uri === field?.displayType
    )?.[0];
    this.conceptScheme = this.conceptSchemes.filter(
      (cs) => cs.uri === field?.conceptScheme
    )?.[0];

    this.isSaving = false;
    this.isDeleteWarningShown = false;
    this.isDeleting = false;
  }

  @action
  updateFieldName(event) {
    this.label = event.target?.value;
  }

  @action
  updateSelectedDisplayType(displayType) {
    this.displayType = displayType;
  }

  @action
  updateSelectedConceptScheme(conceptScheme) {
    this.conceptScheme = conceptScheme;
  }

  @action
  updateLinkedFormTypeUri(uri) {
    this.linkedFormTypeUri = uri;
  }

  @action
  toggleIsRequired() {
    this.isRequired = !this.isRequired;
  }

  @action
  toggleShowInSummary() {
    this.isShownInSummary = !this.isShownInSummary;
  }

  @action
  async saveFieldChanges() {
    this.isSaving = true;

    if (this.displayType?.isLinkToForm) {
      this.isShownInSummary = false;
    }

    const updatedField = await this.customForms.updateCustomFormField(
      this.args.formDefinitionId,
      this.selectedField.uri,
      {
        label: this.label,
        displayTypeUri: this.displayType.uri,
        conceptSchemeUri: this.conceptScheme?.uri,
        isRequired: this.isRequired,
        isShownInSummary: this.isShownInSummary,
        linkedFormTypeUri: this.linkedFormTypeUri,
        formUri: this.args.selectedField.formUri,
      }
    );
    this.isSaving = false;

    if (this.args.onFieldUpdated) {
      this.args.onFieldUpdated(updatedField);
    }
  }

  @action
  async removeFormField() {
    this.isDeleting = true;
    await this.customForms.removeFormField(
      this.selectedField.uri,
      this.selectedField.formUri
    );
    this.isDeleteWarningShown = false;
    this.isDeleting = false;
    if (this.args.onFieldUpdated) {
      this.args.onFieldUpdated(null);
    }
  }
}

function getDisplayTypes() {
  return trackedFunction(async () => {
    return await this.store.query('display-type', {
      sort: 'label',
    });
  });
}

function getConceptSchemes() {
  return trackedFunction(async () => {
    return await this.store
      .query('concept-scheme', {
        page: { size: 9999 },
      })
      .then((entries) => {
        return [...entries].sort((a, b) =>
          a.displayLabel.localeCompare(b.displayLabel)
        );
      });
  });
}

function setSelectedField() {
  return trackedFunction(async () => {
    this.updateSelectedField(this.args.selectedField);

    return this.args.selectedField;
  });
}
