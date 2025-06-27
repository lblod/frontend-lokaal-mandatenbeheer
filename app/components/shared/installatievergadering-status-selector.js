import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class SharedInstallatievergaderingStatusSelectorComponent extends Component {
  @tracked _options;

  constructor() {
    super(...arguments);
    this._options =
      [...this.args.options].sort((a, b) => a.label - b.label) || [];
  }

  @action
  async selectStatus(status) {
    await this.args.onSelect(status);
  }
}
