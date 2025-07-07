import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked, cached } from '@glimmer/tracking';

import { trackedFunction } from 'reactiveweb/function';
import { use } from 'ember-resources';

import {
  LIBRARY_ENTREES,
  LINK_TO_FORM_CUSTOM_DISPLAY_TYPE,
  TEXT_CUSTOM_DISPLAY_TYPE,
} from 'frontend-lmb/utils/well-known-uris';
import { isCustomDisplayType } from 'frontend-lmb/models/display-type';
import LibraryEntryModel from 'frontend-lmb/models/library-entry';
import { API } from 'frontend-lmb/utils/constants';
import { queryRecord } from 'frontend-lmb/utils/query-record';

export default class CustomFormEditCustomField extends Component {
  @use(setSelectedField) setSelectedField;
  @use(getDisplayTypes) getDisplayTypes;
  @use(getConceptSchemes) getConceptSchemes;
  @use(getLibraryFieldType) getLibraryFieldType;
  @use(getLibraryFieldOptions) getLibraryFieldOptions;

  @service store;
  @service customForms;

  @tracked label;
  @tracked libraryEntryUri;
  @tracked displayType;
  @tracked conceptScheme;
  @tracked linkedFormTypeUri;
  @tracked isRequired;
  @tracked isShownInSummary;

  @tracked isSaving;
  @tracked isDeleteWarningShown;
  @tracked isDeleting;

  fakeLibraryEntry;

  constructor() {
    super(...arguments);
    this.fakeLibraryEntry = LibraryEntryModel.ensureFakeEntry(this.store);
  }

  get isStandardField() {
    return !isCustomDisplayType(this.args.selectedField?.displayType);
  }

  @cached
  get displayTypes() {
    return this.getDisplayTypes?.value || [];
  }

  get libraryFieldOptions() {
    return this.getLibraryFieldOptions?.value || [];
  }

  get canSelectTypeForEntry() {
    return (
      this.libraryFieldType?.isNew &&
      !LIBRARY_ENTREES.includes(this.libraryEntryUri)
    );
  }

  get libraryFieldType() {
    return this.getLibraryFieldType?.value || this.fakeLibraryEntry;
  }

  get isLoadingLibraryFieldType() {
    return !this.getLibraryFieldType?.isFinished;
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
      !this.isLinkFormTypeSelected
    );
  }

  get isLinkFormTypeSelected() {
    if (!this.displayType?.get('isLinkToForm')) {
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
      this.selectedField.libraryEntryUri !== this.libraryEntryUri ||
      this.selectedField.displayType !== this.displayType?.get('uri') ||
      this.selectedField.conceptScheme !== this.conceptScheme?.uri ||
      this.selectedField.isRequired !== this.isRequired ||
      this.selectedField.isShownInSummary !== this.isShownInSummary ||
      this.selectedField.linkedFormTypeUri !== this.linkedFormTypeUri
    );
  }

  @action
  async updateSelectedField(field) {
    this.label = field?.label;
    this.isRequired = !!field?.isRequired;
    this.isShownInSummary = !!field?.isShownInSummary;
    this.linkedFormTypeUri = field?.linkedFormTypeUri;
    this.conceptScheme = this.conceptSchemes.filter(
      (cs) => cs.uri === field?.conceptScheme
    )?.[0];

    this.libraryEntryUri = field.libraryEntryUri;
    this.displayType = this.displayTypes.filter(
      (t) => t.uri === field?.displayType
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
  updateLibraryFieldType(libraryEntry) {
    this.libraryEntryUri = libraryEntry?.uri;
    this.getLibraryFieldType.retry(); // Should have triggerd the tracked function, not sure why not..
    this.displayType =
      this.displayTypes.find(
        (t) => t?.uri === libraryEntry.get('displayType.uri')
      ) || this.displayTypes.find((t) => t?.uri === TEXT_CUSTOM_DISPLAY_TYPE);
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

    if (this.isLinkFormTypeSelected) {
      this.isShownInSummary = false;
    }

    const updatedField = await this.customForms.updateCustomFormField(
      this.args.formDefinitionId,
      this.selectedField.uri,
      {
        label: this.label,
        displayTypeUri: this.displayType?.get('uri'),
        libraryEntryUri: this.libraryEntryUri?.uri,
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
    await this.updateSelectedField(this.args.selectedField);

    return this.args.selectedField;
  });
}

function getLibraryFieldType() {
  return trackedFunction(async () => {
    let fieldType = this.fakeLibraryEntry;
    if (this.libraryEntryUri) {
      fieldType = queryRecord(this.store, 'library-entry', {
        'filter[:uri:]': this.libraryEntryUri,
      });
    }

    return fieldType;
  });
}

function getLibraryFieldOptions() {
  return trackedFunction(async () => {
    const customFieldEntry = LibraryEntryModel.ensureFakeEntry(this.store);
    const response = await fetch(
      `${API.FORM_CONTENT_SERVICE}/custom-form/${this.args.formDefinitionId}/fields`
    );

    if (response.ok) {
      const result = await response.json();
      const fieldsLibraryEntryUris = result.fields
        ?.map((f) => f.libraryEntryUri)
        .filter((hasLibraryEntry) => hasLibraryEntry);
      const allOptions = await this.store.query('library-entry', {
        sort: 'name',
        include: 'display-type',
      });

      return [
        customFieldEntry,
        ...allOptions.filter((o) => !fieldsLibraryEntryUris.includes(o?.uri)),
      ];
    }

    return [customFieldEntry];
  });
}
