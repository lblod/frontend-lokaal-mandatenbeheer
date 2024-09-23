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
      const endedState = this.store.createRecord('mandataris-status-code', {
        label: 'Beeindigd',
        uri: MANDATARIS_BEEINDIGD_STATE,
      });
      this.endedState = endedState;
      this.statusses = [...this.statuses, endedState];
    }
  }
}
