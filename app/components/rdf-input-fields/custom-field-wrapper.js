import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { task } from 'ember-concurrency';
import { consume } from 'ember-provide-consume-context';
import { ForkingStore } from '@lblod/ember-submission-form-fields';

import { JSON_API_TYPE, SOURCE_GRAPH } from 'frontend-lmb/utils/constants';
import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';
import { PROV } from 'frontend-lmb/rdf/namespaces';

export default class RdfInputFieldsCustomFieldWrapperComponent extends Component {
  @consume('on-form-update') onFormUpdate;
  @consume('form-definition') formDefinition;

  @service toaster;
  @service formReplacements;
  @service semanticFormRepository;

  @tracked removing = false;
  @tracked showEditFieldModal;

  // Field properties
  @tracked name;
  @tracked type;
  @tracked order;

  get title() {
    return this.args.field?.label;
  }

  get canSaveChanges() {
    if (this.hasALibraryEntree) {
      return this.fieldHasChanged && this.name && this.order;
    }

    return this.fieldHasChanged && this.name && this.type && this.order;
  }

  get fieldHasChanged() {
    const { label, order, displayType } = this.args.field;

    return (
      this.name != label || this.type != displayType || this.order != order
    );
  }

  @action
  async loadCurrentFieldInfo() {
    const { label, order, displayType } = this.args.field;
    this.name = label;
    this.type = displayType;
    this.order = order;
  }

  @action
  async onRemove() {
    this.removing = true;
    await this.removeField();
    this.onFormUpdate();
    this.removed = false;
  }

  @action
  closeEditFieldModal() {
    this.showEditFieldModal = false;
  }

  @action
  updateField(event) {
    const { name, value } = event.target;
    this[name] = value;
  }

  saveChanges = task(async () => {
    await this.removeField();
    try {
      const result = await fetch(
        `/form-content/${this.formDefinition.id}/fields`,
        {
          method: 'POST',
          headers: {
            'Content-Type': JSON_API_TYPE,
          },
          body: JSON.stringify({
            displayType: this.type,
            order: this.order,
            name: this.name,
          }),
        }
      );

      const body = await result.json();
      const newFormId = body.id;
      this.formReplacements.setReplacement(this.formDefinition.id, newFormId);
      this.onFormUpdate();
    } catch (error) {
      showErrorToast(
        this.toaster,
        'Er ging iets mis bij het opslaan van het veld.'
      );
    }
    this.showEditFieldModal = false;
    showSuccessToast(this.toaster, 'Het veld werd succesvol aangepast.');
  });

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

  get hasALibraryEntree() {
    const localStore = new ForkingStore();
    localStore.parse(this.formDefinition.formTtl, SOURCE_GRAPH, 'text/turtle');
    const libraryEntree = localStore.any(
      this.args.field.uri,
      PROV('wasDerivedFrom'),
      null,
      SOURCE_GRAPH
    );

    return !!libraryEntree;
  }
}
