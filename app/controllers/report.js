import Controller from '@ember/controller';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ReportController extends Controller {
  @tracked selectedReport;

  @action onSelectReport(report) {
    console.log(report);
    this.selectedReport = report;
  }
}
