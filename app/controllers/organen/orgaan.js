import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class OrganenOrgaanController extends Controller {
  queryParams = ['startDate', 'endDate'];

  @tracked startDate;
  @tracked endDate;

  @action
  selectPeriod(period) {
    this.startDate = period.startDate;
    this.endDate = period.endDate;
  }
}
