import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class MandatarisStatusService extends Service {
  @tracked statuses = [];

  @service store;

  endedState = null;

  constructor() {
    super(...arguments);
    this.endedState = this.store.createRecord('mandataris-status-code', {
      label: 'Beëindigd',
    });
  }

  async loadStatusOptions() {
    if (this.statuses.length === 0) {
      this.statuses = await this.store.findAll('mandataris-status-code');
    }
  }
}
