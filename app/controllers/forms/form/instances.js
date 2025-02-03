import Controller from '@ember/controller';

import { action } from '@ember/object';
import { A } from '@ember/array';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { task, timeout } from 'ember-concurrency';
import { JSON_API_TYPE, SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';

export default class FormInstancesController extends Controller {
  queryParams = ['page', 'size', 'sort', 'filter'];

  @service router;
  @tracked page = 0;
  @tracked sort = 'uri';
  @tracked filter = '';
  @tracked isUpdating;
  @tracked columnLabels = A([
    {
      name: 'Uri',
      var: 'uri',
      uri: null,
    },
  ]);
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
  updateTable(selectedLabels) {
    this.isUpdating = true;
    this.columnLabels.clear();
    this.columnLabels.push(...selectedLabels);
  }

  @action
  async downloadLink() {
    const response = await fetch(
      `/form-content/instance-table/${this.model.formDefinition.id}/download`,
      {
        method: 'POST',
        headers: {
          'Content-Type': JSON_API_TYPE,
        },
        body: JSON.stringify({
          labels: this.columnLabels,
        }),
      }
    );
    const csvString = await response.text();
    let blob = new Blob([csvString], { type: 'text/csv' });
    let downloadLink = document.createElement('a');
    downloadLink.download = 'instances';
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.click();
    downloadLink.remove();
  }

  @action
  onTableLoaded() {
    this.isUpdating = false;
  }
}
