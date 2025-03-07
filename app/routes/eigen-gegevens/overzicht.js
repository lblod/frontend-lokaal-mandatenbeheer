import Route from '@ember/routing/route';

import { service } from '@ember/service';

import { showErrorToast } from 'frontend-lmb/utils/toasts';

export default class EigenGegevensOverzichtRoute extends Route {
  @service toaster;
  async model() {
    let formNames = [];
    try {
      const response = await fetch('/form-content/forms');
      const form = await response.json();
      formNames = form.formDirectories;
    } catch (error) {
      showErrorToast(
        this.toaster,
        'Er ging iets mis bij het ophalen van het overzicht van formulieren.'
      );
    }

    return {
      formNames,
    };
  }
}
