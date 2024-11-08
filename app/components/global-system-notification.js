import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class GlobalSystemNotification extends Component {
  @service store;
  @service globalSystemMessage;

  @tracked message;

  constructor() {
    super(...arguments);
    this.setMessage();
  }

  get show() {
    return this.message;
  }

  async setMessage() {
    const systemMessage = await this.globalSystemMessage.findMessage();

    this.message = systemMessage?.message;
  }
}
