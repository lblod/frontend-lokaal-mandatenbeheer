import Controller from '@ember/controller';

import { service } from '@ember/service';

export default class IndexController extends Controller {
  @service currentSession;

  get showLegislatuurModule() {
    return this.currentSession.showLegislatuurModule;
  }
}
