import Service from '@ember/service';

import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import {
  burgemeesterOnlyStates,
  MANDATARIS_BEEINDIGD_STATE,
  notBurgemeesterStates,
} from 'frontend-lmb/utils/well-known-uris';

export default class MandatarisStatusService extends Service {
  @tracked statuses = [];

  @service store;

  endedState = null;

  async getStatusOptionsForMandate(mandate) {
    const isBurgemeester = mandate.get('bestuursfunctie').get('isBurgemeester');

    const statuses = this.statuses.slice();

    if (isBurgemeester) {
      return statuses.filter(
        (status) => !notBurgemeesterStates.includes(status.uri)
      );
    }
    return statuses.filter(
      (status) => !burgemeesterOnlyStates.includes(status.uri)
    );
  }

  async loadStatusOptions() {
    if (this.statuses.length === 0) {
      this.statuses = await this.store.findAll('mandataris-status-code');
      const endedState = this.store.createRecord('mandataris-status-code', {
        label: 'Beëindigd',
        uri: MANDATARIS_BEEINDIGD_STATE,
      });
      this.endedState = endedState;
      this.statusses = [...this.statuses, endedState];
    }
  }
}
