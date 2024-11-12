import Component from '@glimmer/component';

import { service } from '@ember/service';

export default class GlobalSystemNotification extends Component {
  @service globalSystemMessage;

  constructor() {
    super(...arguments);
    this.globalSystemMessage.periodicallyCheckMessage();
  }
}
