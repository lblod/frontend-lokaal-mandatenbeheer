import Controller from '@ember/controller';

import { action } from '@ember/object';
import { A } from '@ember/array';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { task, timeout } from 'ember-concurrency';
import { SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';

export default class FormInstancesController extends Controller {
  queryParams = ['page', 'size', 'sort', 'filter'];

  @service router;
  @tracked page = 0;
  @tracked sort = 'uri';
  @tracked filter = '';
  @tracked isUpdatingLabels;
  @tracked columnLabels = A();
  size = 10;

  @action
  async onRemoveInstance() {
    this.router.refresh();
  }

  search = task({ restartable: true }, async (searchData) => {
    await timeout(SEARCH_TIMEOUT);
    this.page = 0;
    this.filter = searchData;
  });

  @action
  updateTable(selectedLabels = []) {
    this.isUpdatingLabels = true;
    this.columnLabels.clear();
    this.columnLabels.push(...selectedLabels);
    this.isUpdatingLabels = false;
  }
}
