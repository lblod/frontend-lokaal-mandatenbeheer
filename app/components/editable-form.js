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
  }

  get editableFormsEnabled() {
    return this.features.isEnabled('editable-forms');
  }

  @provide('on-form-update')
  @action
  onFormUpdate() {
    this.updateForm();
  }

  @provide('form-definition')
  get formDefinition() {
    return this.currentForm;
  }
}
