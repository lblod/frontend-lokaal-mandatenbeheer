import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';

import { consume } from 'ember-provide-consume-context';

export default class RdfInputFieldsCustomFieldWrapperComponent extends Component {
  @consume('on-form-update') onFormUpdate;
  @consume('form-definition') formDefinition;

  @tracked showModal;

  get title() {
    return this.args.field?.label;
  }
}
