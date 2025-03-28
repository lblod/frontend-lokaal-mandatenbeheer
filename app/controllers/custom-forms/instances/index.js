import Controller from '@ember/controller';

import { action } from '@ember/object';
import { A } from '@ember/array';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';

import { task, timeout } from 'ember-concurrency';
import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';

export default class CustomFormsInstancesIndexController extends Controller {
  queryParams = ['page', 'size', 'sort', 'filter'];

  @service router;
  @service toaster;

  @tracked isDeleteModalOpen;
  @tracked isDeleting;

  @tracked isEditFormDefinitionOpen;
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
  onTableLoaded() {
    this.isUpdating = false;
  }

  @action
  closeEditFormDefinitionModal() {
    this.isEditFormDefinitionOpen = false;
  }

  @action
  preventSave(ttl) {
    if (!ttl) {
      return;
    }
    throw new Error('Niet bewaren aub', ttl);
  }

  @action
  openDeleteFormModal(formModel) {
    this.isDeleteModalOpen = true;
    this.formToDelete = formModel;
  }

  @action
  async deleteForm() {
    this.isDeleting = true;
    try {
      await this.model.form.destroyRecord();
      showSuccessToast(
        this.toaster,
        'Formulier definitie and instances succesvol verwijderd',
        'Formulier'
      );
    } catch (error) {
      showErrorToast(
        this.toaster,
        'Er liep iets mis bij het verwijderen van het formulier',
        'Formulier'
      );
    }
    this.isDeleting = false;
    this.isDeleteModalOpen = false;
    this.formToDelete = null;
  }

  get removeFormModalText() {
    if (this.model.usage.hasUsage) {
      const usageCount = this.model.usage.usageUris.length;
      let text = (variableText) =>
        `${variableText} van dit type gevonden. Door verder te gaan zal de definitie met zijn implementaties definitief verwijderd worden.`;

      if (usageCount > 1) {
        return text(`Er werden ${usageCount} formulieren `);
      }
      return text(`Er werd ${usageCount} formulier `);
    }

    return 'Door verder te gaan zal de formulier definitie verwijderd worden.';
  }
}
