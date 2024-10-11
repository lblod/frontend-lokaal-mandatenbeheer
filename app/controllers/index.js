import Controller from '@ember/controller';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class IndexController extends Controller {
  @service currentSession;
  @service features;

  @tracked showLegislatuurModule;

  constructor() {
    super(...arguments);

    this.showModules();
  }

  async showModules() {
    this.showLegislatuurModule =
      await this.currentSession.showLegislatuurModule();
  }
}
