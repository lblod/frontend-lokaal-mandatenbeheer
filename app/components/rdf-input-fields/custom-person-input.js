import Component from '@glimmer/component';
import { consume } from 'ember-provide-consume-context';

export default class RdfInputFieldsCustomPersonInputComponent extends Component {
  @consume('form-state') formState;

  get hideLabel() {
    return !this.formState?.isReadOnly;
  }

  get isReadOnly() {
    return this.formState?.isReadOnly;
  }
}
