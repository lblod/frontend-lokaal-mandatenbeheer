import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class SharedCompactMenuComponent extends Component {
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
