import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';

export default class SharedInstallatievergaderingStatusSelectorComponent extends Component {
  @service('installatievergadering') ivService;

  @action
  async selectStatus(status) {
    await this.ivService.setStatus(status);
  }
}
