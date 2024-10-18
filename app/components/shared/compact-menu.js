import Component from '@glimmer/component';

import { service } from '@ember/service';

export default class SharedCompactMenuComponent extends Component {
  @service currentSession;
  @service features;

  get showLegislatuurModule() {
    return this.currentSession.showLegislatuurModule;
  }
}
