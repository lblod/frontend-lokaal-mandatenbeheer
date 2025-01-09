import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class CustomFormFieldsDisplayTypeSelectorComponent extends Component {
  @service store;

  @tracked typeOptions = [];

  @action
  async load() {
    this.typeOptions = await this.store.findAll('display-type');
  }

  @action
  async updateSelectedType(type) {
    // This event.target is used in the update method of the edit field /custom-field-wrapper-js
    this.args.onTypeUpdated({
      target: { name: this.args.variableName, value: type.uri },
    });
  }

  get label() {
    return this.args.label || 'Type';
  }

  get selectedType() {
    return this.typeOptions.find(
      (option) => option.uri === this.args.displayTypeUri
    );
  }
}
