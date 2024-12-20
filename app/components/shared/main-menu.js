import Component from '@glimmer/component';

import { service } from '@ember/service';

export default class SharedMainMenuComponent extends Component {
  @service currentSession;
  @service features;
  @service impersonation;

  get showLegislatuurModule() {
    return this.currentSession.showLegislatuurModule;
  }

  get showCommonModules() {
    if (!this.currentSession.isAdmin) {
      return true;
    }

    return this.impersonation.isImpersonating;
  }
}
