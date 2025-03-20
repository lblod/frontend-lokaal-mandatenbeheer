import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { task } from 'ember-concurrency';
import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { consume } from 'ember-provide-consume-context';

import { JSON_API_TYPE, SOURCE_GRAPH } from 'frontend-lmb/utils/constants';
import { PROV } from 'frontend-lmb/rdf/namespaces';
import { showErrorToast } from 'frontend-lmb/utils/toasts';
import {
  LIBRARY_ENTREES,
  TEXT_CUSTOM_DISPLAY_TYPE,
} from 'frontend-lmb/utils/well-known-uris';
import { handleResponse } from 'frontend-lmb/utils/handle-response';

export default class RdfInputFieldCrudCustomFieldModalComponent extends Component {
  @consume('form-context') formContext;

  @service store;
  @service toaster;
  @service formReplacements;

  @tracked isRemovingField;
  @tracked isFieldRequired;
  @tracked wantsToRemove;

  customFieldEntry = this.store.createRecord('library-entry', {
    name: 'Eigen veld',
  });

  @tracked fieldName;
  @tracked libraryFieldType = this.customFieldEntry;
  @tracked displayType;

  constructor() {
    super(...arguments);

    let withValue = TEXT_CUSTOM_DISPLAY_TYPE;
    if (!this.args.isCreating) {
      const { label, displayType } = this.args.field;

      this.fieldName = label;
      withValue = displayType;
    }
    this.isFieldRequired = this.args.isRequiredField ?? false;
    this.displayTypes.then((displayTypes) => {
      this.displayType = displayTypes.findBy('uri', withValue);
    });
  }

  get deleteWillLoseData() {
    return this.libraryFieldType?.uri !== null;
  }

  @action
  updateFieldName(event) {
    this.fieldName = event.target?.value;
  }

  @action
  toggleIsRequired() {
    this.isFieldRequired = !this.isFieldRequired;
  }

  updateField = task(async () => {
    try {
      await fetch(
        `/form-content/${this.formContext.formDefinition.id}/fields`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': JSON_API_TYPE,
          },
          body: JSON.stringify({
            field: this.args.field.uri.value,
            displayType: this.displayType.uri,
            name: this.fieldName,
            isRequired: !!this.isFieldRequired,
          }),
        }
      );
      this.formContext.onFormUpdate();
    } catch (error) {
      showErrorToast(
        this.toaster,
        'Er ging iets mis bij het opslaan van het veld.'
      );
      return;
    }
  });

  createField = task(async () => {
    const result = await fetch(
      `/form-content/${this.formContext.formDefinition.id}/fields`,
      {
        method: 'POST',
        headers: {
          'Content-Type': JSON_API_TYPE,
        },
        body: JSON.stringify({
          displayType: this.displayType.uri,
          libraryEntryUri: this.libraryFieldType.uri,
          name: this.fieldName,
          isRequired: !!this.isFieldRequired,
        }),
      }
    );
    try {
      const body = await handleResponse({ result });
      const newFormId = body.id;
      this.formReplacements.setReplacement(
        this.formContext.formDefinition.id,
        newFormId
      );
      this.formContext.onFormUpdate();
    } catch (error) {
      showErrorToast(
        this.toaster,
        'Er ging iets mis bij het opslaan van het veld.'
      );
    }
  });

  @action
  selectLibraryFieldType(libraryEntry) {
    this.libraryFieldType = libraryEntry;
    this.displayTypes.then((types) => {
      this.displayType =
        types.findBy('uri', libraryEntry.get('displayType.uri')) ||
        types.findBy('uri', TEXT_CUSTOM_DISPLAY_TYPE);
    });
  }

  @action
  selectDisplayType(displayType) {
    this.displayType = displayType;
  }

  @action
  onCancel() {
    if (this.wantsToRemove) {
      this.wantsToRemove = false;
      return;
    }
    this.closeModal();
  }

  @action
  async onRemove() {
    if (!this.wantsToRemove) {
      this.wantsToRemove = true;
      return;
    }
    this.isRemovingField = true;
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
    this.formContext.onFormUpdate();
    this.isRemovingField = false;
  }

  @action
  closeModal() {
    this.args.onCloseModal();
  }

  get displayTypes() {
    return this.store.findAll('display-type').then((entries) => {
      return entries.sortBy('label');
    });
  }

  get libraryEntryUri() {
    if (!this.args.field) {
      return null;
    }

    const localStore = new ForkingStore();
    localStore.parse(
      this.formContext.formDefinition.formTtl,
      SOURCE_GRAPH,
      'text/turtle'
    );
    const libraryEntree = localStore.any(
      this.args.field.uri,
      PROV('wasDerivedFrom'),
      null,
      SOURCE_GRAPH
    );

    return libraryEntree?.value;
  }

  get libraryFieldOptions() {
    const forkingStore = new ForkingStore();
    forkingStore.parse(
      this.formContext.formDefinition.formTtl,
      SOURCE_GRAPH,
      'text/turtle'
    );

    const alreadyUsedLibraryEntries = forkingStore
      .match(null, PROV('wasDerivedFrom'), null, SOURCE_GRAPH)
      .map((triple) => triple.object.value);

    return this.store
      .findAll('library-entry', { include: 'display-type' })
      .then((entries) => {
        return [
          this.customFieldEntry,
          ...entries
            .sortBy('id')
            .reverse()
            .filter((entry) => {
              return (
                entry.uri && alreadyUsedLibraryEntries.indexOf(entry.uri) < 0
              );
            }),
        ];
      });
  }

  get canSaveChanges() {
    return (
      this.fieldHasChanged && this.hasValidFieldName && this.libraryFieldType
    );
  }

  get fieldHasChanged() {
    if (this.args.isCreating) {
      return this.hasValidFieldName;
    }

    return (
      (this.hasValidFieldName && this.fieldName !== this.args.field.label) ||
      this.displayType.uri !== this.args.field.displayType ||
      this.isFieldRequired != this.args.isRequiredField
    );
  }

  get hasValidFieldName() {
    return this.fieldName && this.fieldName.trim().length > 1;
  }

  get canSelectTypeForEntry() {
    if (this.args.isCreating) {
      return this.libraryFieldType === this.customFieldEntry;
    }

    return !LIBRARY_ENTREES.includes(this.libraryEntryUri);
  }

  get saveTooltipText() {
    if (this.args.isCreating) {
      return 'Vul eerst al de velden in';
    }

    return 'Geen aanpassingen gevonden';
  }

  get title() {
    if (this.args.isCreating) {
      return 'Voeg een veld toe';
    }

    return 'Pas een veld aan';
  }
}
