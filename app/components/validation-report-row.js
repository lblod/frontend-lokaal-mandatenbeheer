import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ValidationReportRow extends Component {
  @tracked collapsed = true;
  @action
  toggleCollapsed() {
    this.collapsed = !this.collapsed;
  }
}
