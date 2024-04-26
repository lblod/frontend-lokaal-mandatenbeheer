import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class DraftMandatarisListComponent extends Component {
  @action
  async onClick() {
    console.log('test');
  }
}
