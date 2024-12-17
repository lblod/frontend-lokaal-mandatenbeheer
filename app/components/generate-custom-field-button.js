import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class GenerateCustomFieldButtonComponent extends Component {
  @action
  onAddField() {
    console.log(`add clicked ${this.args.form.id}`);
  }
}
