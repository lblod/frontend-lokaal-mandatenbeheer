import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { JSON_API_TYPE } from 'frontend-lmb/utils/constants';
import { showErrorToast } from 'frontend-lmb/utils/toasts';

import { TEXT_CUSTOM_DISPLAY_TYPE_ID } from 'frontend-lmb/utils/well-known-ids';
import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { SOURCE_GRAPH } from 'frontend-lmb/utils/constants';
import { PROV } from 'frontend-lmb/rdf/namespaces';
export default class GenerateCustomFieldButtonComponent extends Component {
  @service formReplacements;
  @service store;
  @service toaster;

  @tracked showModal = false;
  @tracked loading = false;
  @tracked fieldName = '';
  customFieldEntry = this.store.createRecord('library-entry', {
    name: 'Eigen veld',
  });
  @tracked selectedLibraryFieldType = this.customFieldEntry;
  @tracked selectedDisplayType = null;

  constructor() {
    super(...arguments);
    this.displayTypes.then((displayTypes) => {
      this.selectedDisplayType = displayTypes.findBy(
        'id',
        TEXT_CUSTOM_DISPLAY_TYPE_ID
      );
    });
  }

  get invalidName() {
    return !this.fieldName || this.fieldName.trim().length < 1;
  }

  get disabled() {
    return this.invalidName;
  }

  get libraryFieldOptions() {
    const forkingStore = new ForkingStore();
    forkingStore.parse(this.args.form.formTtl, SOURCE_GRAPH, 'text/turtle');

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

  get displayTypes() {
    return this.store.findAll('display-type').then((entries) => {
      return entries.sortBy('label');
    });
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

  @action
  selectLibraryFieldType(libraryEntry) {
    this.selectedLibraryFieldType = libraryEntry;
    this.displayTypes.then((types) => {
      this.selectedDisplayType =
        types.findBy('uri', libraryEntry.get('displayType.uri')) ||
        types.findBy('id', TEXT_CUSTOM_DISPLAY_TYPE_ID);
    });
  }

  @action
  selectDisplayType(displayType) {
    this.selectedDisplayType = displayType;
  }

  @action async onSaveField() {
    this.loading = true;
    try {
      const result = await fetch(`/form-content/${this.args.form.id}/fields`, {
        method: 'POST',
        headers: {
          'Content-Type': JSON_API_TYPE,
        },
        body: JSON.stringify({
          displayType: this.selectedDisplayType.uri,
          libraryEntryUri: this.selectedLibraryFieldType.uri,
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
    } catch (error) {
      showErrorToast(
        this.toaster,
        'Er ging iets mis bij het opslaan van het veld.'
      );
    }
    this.loading = false;
    this.showModal = false;
  }

  @action updateName(event) {
    this.fieldName = event.target.value;
  }
}
