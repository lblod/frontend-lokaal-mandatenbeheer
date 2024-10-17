import Component from '@glimmer/component';

import { service } from '@ember/service';

export default class SharedMainMenuComponent extends Component {
  @service currentSession;
  @service features;

  get showLegislatuurModule() {
    return this.currentSession.showLegislatuurModule;
  }
}
