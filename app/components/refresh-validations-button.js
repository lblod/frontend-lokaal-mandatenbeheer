import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';

import moment from 'moment';
import { timeout } from 'ember-concurrency';

import { JSON_API_TYPE } from 'frontend-lmb/utils/constants';

export default class RefreshValidationsButton extends Component {
  @service validatie;
  @service currentSession;

  constructor() {
    super(...arguments);
    this.validatie.setLastRunningStatus();
  }

  @action
  async refresh() {
    const bestuurseenheid = this.currentSession.group;
    const response = await fetch(`/validation-report-api/reports/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': JSON_API_TYPE,
      },
      body: JSON.stringify({
        bestuurseenheidUri: bestuurseenheid.uri,
      }),
    });
    if (response.ok) {
      for (let index = 0; index < 5; index++) {
        await timeout(500);
        this.validatie.polling.perform();
        if (this.validatie.runningStatus) {
          return;
        }
      }
    }
  }

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
