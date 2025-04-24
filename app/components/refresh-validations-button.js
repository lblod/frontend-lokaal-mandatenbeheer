import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';

import moment from 'moment';

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
    this.validatie.generateReport.perform(bestuurseenheid);
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
    return this.validatie.isRunning;
  }
}
