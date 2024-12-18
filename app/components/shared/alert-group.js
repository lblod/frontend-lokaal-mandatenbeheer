import Component from '@glimmer/component';

import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { provide } from 'ember-provide-consume-context';

export default class SharedAlertGroupComponent extends Component {
  @tracked alerts = A();
  @tracked index = 0;

  @provide('alert-group')
  get alertsState() {
    return this.alerts;
  }

  get currentAlert() {
    return this.alerts.objectAt(0);
  }

  get hasMultipleAlerts() {
    return this.alerts.length > 1;
  }

  @action
  previous() {
    const current = this.currentAlert;
    this.alerts.removeObject(current);
    this.alerts.pushObject(current);
    this.index -= 1;
    if (this.index < 0) {
      this.index = this.alerts.length - 1;
    }
  }
  @action
  next() {
    const current = this.currentAlert;
    this.alerts.removeObject(current);
    this.alerts.pushObject(current);
    this.index += 1;
    if (this.index >= this.alerts.length) {
      this.index = 0;
    }
  }
}
