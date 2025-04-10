import Component from '@glimmer/component';

import { service } from '@ember/service';

import { task } from 'ember-concurrency';
import moment from 'moment';

export default class RefreshValidationsButton extends Component {
  @service validatie;

  constructor() {
    super(...arguments);
    this.validatie.setLastRunningStatus();
  }

  refresh = task(async () => {
    console.log(`todo manually trigger sync`);
  });

  get lastRefreshedDate() {
    if (!this.validatie.lastRunnningStatus?.finishedAt) {
      return 'Onbekend';
    }
    return moment(this.validatie.lastRunnningStatus.finishedAt).format(
      'DD-MM-YYYY HH:mm:ss'
    );
  }

  get isGeneratingReport() {
    return this.validatie.runningStatus;
  }
}
