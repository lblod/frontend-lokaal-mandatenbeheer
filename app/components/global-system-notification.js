import Component from '@glimmer/component';

import { service } from '@ember/service';

export default class GlobalSystemNotification extends Component {
  @service globalSystemMessage;
}
