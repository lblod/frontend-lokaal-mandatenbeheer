import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';

import moment from 'moment';
import { timeout } from 'ember-concurrency';

import { JSON_API_TYPE } from 'frontend-lmb/utils/constants';
import { showSuccessToast, showWarningToast } from 'frontend-lmb/utils/toasts';

export default class RefreshValidationsButton extends Component {
  @service validatie;
  @service currentSession;
  @service toaster;

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
        await timeout(250);
        this.validatie.polling.perform();
        if (this.validatie.runningStatus) {
          showSuccessToast(
            this.toaster,
            'Rapport wordt gegenereerd. Dit kan mogelijks een tijdje duren.',
            'Validatie rapport'
          );
          return;
        }
      }
      showWarningToast(
        this.toaster,
        'De service laat van zich weten. Het genereren van het rapport is gestart in de achtergrond. Mogelijks moet je de pagina refreshen om de status op te volgen.',
        'Validatie rapport'
      );
    }
  }

  get isPreviousreportFound() {
    return this.validatie.lastRunnningStatus?.finishedAt;
  }

  get lastRefreshedDate() {
    if (!this.isPreviousreportFound) {
      return 'Onbekend';
    }
    return moment(this.validatie.lastRunnningStatus.finishedAt).format(
      'DD-MM-YYYY HH:mm:ss'
    );
  }

  get isGeneratingReport() {
    return this.validatie.runningStatus;
  }

  get tooltipLastSyncText() {
    const lastStatus = this.validatie.lastRunnningStatus;
    this.validatie.lastRunnningStatus;
    if (!lastStatus) {
      return null;
    }
    if (!lastStatus.startedAt || !lastStatus.finishedAt) {
      return null;
    }
    const startedAt = moment(lastStatus.startedAt);
    const finishedAt = moment(lastStatus.finishedAt);
    const duration = moment.duration(finishedAt.diff(startedAt));
    const minutes = Math.floor(duration.asMinutes());
    const textForMinutes = `${minutes} ${minutes === 1 ? 'minuut' : 'minuten'} en`;

    return `Vorige sync heeft ${minutes !== 0 ? textForMinutes : ''} ${duration.seconds()} seconden geduurd.`;
  }
}
