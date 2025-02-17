import Controller from '@ember/controller';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { showSuccessToast } from 'frontend-lmb/utils/toasts';

export default class CodelijstenDetailViewController extends Controller {
  @service router;
  @service toaster;

  @tracked isDeleting;

  get isReadOnly() {
    return this.model.codelijst?.isReadOnly;
  }

  get editButtonTooltipText() {
    return this.isReadOnly
      ? 'Deze codelijst kan niet aangepast worden.'
      : 'Pas deze codelijst aan.';
  }

  @action
  async deleteCodelist() {
    this.isDeleting = true;
    await this.deleteConcepts();
    await this.model.codelijst.destroyRecord();
    showSuccessToast(
      this.toaster,
      'Codelijst succesvol verwijderd',
      'Codelijst'
    );
    this.isDeleting = false;
    this.router.transitionTo('codelijsten.overzicht');
  }

  async deleteConcepts() {
    await Promise.all(
      this.model.concepten.map(async (concept) => await concept.destroyRecord())
    );
  }

  @action
  editCodelist() {
    this.router.transitionTo(
      'codelijsten.detail.edit',
      this.model.codelijst.id
    );
  }
}
