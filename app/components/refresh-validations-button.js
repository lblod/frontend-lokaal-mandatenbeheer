import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';

import moment from 'moment';

export default class RefreshValidationsButton extends Component {
  @service validatie;
  @service currentSession;
  @service toaster;
  @service router;

  constructor() {
    super(...arguments);
    this.validatie.setLastRunningStatus();
  }

  get isPreviousreportFound() {
    return this.validatie.lastRunnningStatus?.finishedAt;
  }

  get lastRefreshedDate() {
    if (!this.isPreviousreportFound) {
      return 'Onbekend';
    }
    return moment(this.validatie.lastRunnningStatus.finishedAt).format(
      'DD-MM-YYYY HH:mm'
    );
  }

  get isGeneratingReport() {
    return this.validatie.isRunning;
  }

  @action
  goToReportPage() {
    this.router.transitionTo('report');
  }

  @action
  async refresh() {
    const bestuurseenheid = this.currentSession.group;
    this.validatie.generateReport.perform(bestuurseenheid);
  }
}
