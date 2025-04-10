import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';

import { task } from 'ember-concurrency';
import moment from 'moment';

export default class RefreshValidationsButton extends Component {
  @tracked lastSyncDate = new Date();

  refresh = task(async () => {
    this.lastSyncDate = new Date();
  });

  get lastRefreshedDate() {
    return moment(this.lastSyncDate).format('DD-MM-YYYY HH:mm:ss');
  }
}
