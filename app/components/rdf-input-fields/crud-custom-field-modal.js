import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { task } from 'ember-concurrency';
import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { consume } from 'ember-provide-consume-context';

import { JSON_API_TYPE, SOURCE_GRAPH } from 'frontend-lmb/utils/constants';
import { PROV } from 'frontend-lmb/rdf/namespaces';
import { TEXT_CUSTOM_DISPLAY_TYPE_ID } from 'frontend-lmb/utils/well-known-ids';

export default class RdfInputFieldCrudCustomFieldModalComponent extends Component {
  @consume('form-definition') formDefinition;

  @service store;

  @tracked isRemovingField;

  customFieldEntry = this.store.createRecord('library-entry', {
    name: 'Eigen veld',
  });

  // Field properties
  @tracked fieldName;
  @tracked libraryFieldType = this.customFieldEntry;
  @tracked displayType;

  constructor() {
    super(...arguments);

    if (this.args.isCreating) {
      this.displayTypes.then((displayTypes) => {
        this.displayType = displayTypes.findBy(
          'id',
          TEXT_CUSTOM_DISPLAY_TYPE_ID
        );
      });
    }
  }

  @action
  updateField(event) {
    const { name, value } = event.target;
    this[name] = value;
  }

  saveChanges = task(async () => {});

  @action
  selectLibraryFieldType(libraryEntry) {
    this.libraryFieldType = libraryEntry;
    this.displayTypes.then((types) => {
      this.displayType =
        types.findBy('uri', libraryEntry.get('displayType.uri')) ||
        types.findBy('id', TEXT_CUSTOM_DISPLAY_TYPE_ID);
    });
  }

  async removeField() {
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
  }

  @action
  async onRemove() {
    this.isRemovingField = true;
    await this.removeField();
    this.onFormUpdate();
    this.isRemovingField = false;
  }

  @action
  closeModal() {
    if (this.args.onCloseModal) {
      this.fieldName = null;
      this.libraryFieldType = null;
      this.displayType = null;
      this.args.onCloseModal();
    }
  }

  get displayTypes() {
    return this.store.findAll('display-type').then((entries) => {
      return entries.sortBy('label');
    });
  }

  get libraryFieldOptions() {
    const forkingStore = new ForkingStore();
    forkingStore.parse(
      this.formDefinition.formTtl,
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
      return this.fieldName && this.libraryFieldType;
    }

    return this.fieldName !== this.args.field.label;
  }

  get hasValidFieldName() {
    return this.fieldName || this.fieldName.trim().length > 1;
  }

  get title() {
    if (this.args.isCreating) {
      return 'Voeg een veld toe';
    }

    return 'Pas een veld aan';
  }

  get saveText() {
    if (this.args.isCreating) {
      return 'Bewaar';
    }

    return 'Pas aan';
  }
}
