import Service from '@ember/service';

import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { MANDATARIS_BEEINDIGD_STATE } from 'frontend-lmb/utils/well-known-uris';

export default class MandatarisStatusService extends Service {
  @tracked statuses = [];

  @service store;

  endedState = null;

  async loadStatusOptions() {
    if (this.statuses.length === 0) {
      this.statuses = await this.store.findAll('mandataris-status-code');
      this.endedState = this.statuses.find((status) => {
        return status.uri === MANDATARIS_BEEINDIGD_STATE;
      });
    }
  }
}
