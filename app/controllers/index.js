import Controller from '@ember/controller';

import { service } from '@ember/service';

export default class IndexController extends Controller {
  @service currentSession;
  @service impersonation;

  get showLegislatuurModule() {
    return this.currentSession.showLegislatuurModule;
  }

  get showRegularModules() {
    return !this.currentSession.isAdmin || this.impersonation.isImpersonating;
  }
}
