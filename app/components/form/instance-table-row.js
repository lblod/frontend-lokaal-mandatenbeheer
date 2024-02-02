import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class InstanceTableRowComponent extends Component {
  @action
  async remove() {
    await this.args.remove(this.args.instance.id);
  }
}
