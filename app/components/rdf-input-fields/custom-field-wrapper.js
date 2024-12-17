import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class RdfInputFieldsCustomFieldWrapperComponent extends Component {
  get title() {
    return this.args.field?.label;
  }

  @action
  onRemove() {
    console.log(
      `remove clicked on ${this.args.field.uri} of form ${this.args.form}`
    );
  }
}
