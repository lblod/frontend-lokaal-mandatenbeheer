import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class MandatarissenMandatarisPublicationStatusSelectorComponent extends Component {
  @tracked _options;

  constructor() {
    super(...arguments);
    this._options = this.args.options?.sortBy('label') || [];
  }
}
