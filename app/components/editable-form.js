import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { provide } from 'ember-provide-consume-context';

export default class EditableFormComponent extends Component {
  baseFormId;
  @tracked currentForm;
  @tracked loading = true;
  @service formReplacements;
  @service semanticFormRepository;
  @service features;

  @tracked showEditModal;
  @tracked clickedField;

  constructor() {
    super(...arguments);
    this.baseFormId = this.args.form.id;
    this.updateForm();
  }

  async updateForm() {
    this.loading = true;
    const currentFormId = this.formReplacements.getReplacement(this.baseFormId);
    const form = await this.semanticFormRepository.getFormDefinition(
      currentFormId,
      true
    );
    this.currentForm = form;
    this.loading = false;
    this.showEditModal = false;
  }

  @action
  setClickedField(field) {
    if (!this.formContext.canSelectField) {
      return;
    }
    this.clickedField = field;
    if (this.args.onFieldSelected) {
      this.args.onFieldSelected(field.uri.value);
    }
  }

  get editableFormsEnabled() {
    return this.features.isEnabled('editable-forms');
  }

  @provide('form-context')
  get formContext() {
    return {
      onFormUpdate: () => this.updateForm(),
      onFieldClicked: (field) => this.setClickedField(field),
      canSelectField: !!this.args.canSelectField,
      formDefinition: this.currentForm,
      clickedField: this.clickedField,
      isReadOnly: this.args.isReadOnly,
    };
  }
}
