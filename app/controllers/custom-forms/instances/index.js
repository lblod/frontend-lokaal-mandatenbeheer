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
  @service customForms;

  @tracked isDeleteModalOpen;
  @tracked isDeleting;

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
  goToEditFormDefinition() {
    this.router.transitionTo(
      'custom-forms.instances.definition',
      this.model.form.id
    );
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
      await this.customForms.removeFormDefinitionWithUsage(this.model.form);
      showSuccessToast(
        this.toaster,
        'Formulier definitie and instances succesvol verwijderd',
        'Formulier'
      );
      this.router.transitionTo('custom-forms');
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

  get formUsageLabels() {
    if (this.model.customFormConfigurationUsage.hasUsage) {
      return this.model.customFormConfigurationUsage.formLabels;
    }
    return null;
  }

  get removeFormModalText() {
    if (this.model.customFormConfigurationUsage.hasUsage) {
      return `Dit type formulier wordt gebruikt in de configuratie van een extensie of eigen formulier. Hierdoor kan je dit formulier niet verwijderen.`;
    }

    if (this.model.usage.hasUsage) {
      const postFix =
        'Door verder te gaan zullen alle formulieren definitief verwijderd worden.';
      let countText = `Er werd ${this.model.usage.count} formulier(en) gevonden. `;

      if (this.model.usage.count > 1) {
        countText = `Er werden ${this.model.usage.count} formulier(en) gevonden. `;
      }

      return countText + postFix;
    }

    return 'Door verder te gaan zal dit formulier definitief verwijderd worden.';
  }
}
