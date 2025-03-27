import Controller from '@ember/controller';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';

export default class CustomFormsOverviewController extends Controller {
  @service toaster;

  @tracked page = 0;
  @tracked size = 20;

  @action
  async deleteForms(formModel) {
    try {
      await formModel.destroyRecord();
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
  }
}
