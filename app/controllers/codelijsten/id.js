import Controller from '@ember/controller';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { showSuccessToast } from 'frontend-lmb/utils/toasts';

export default class CodelijstenIdController extends Controller {
  @service router;
  @service toaster;

  @tracked isDeleting;

  get isReadOnly() {
    return this.model.codelijst?.readOnly;
  }

  get editButtonTooltipText() {
    return this.isReadOnly
      ? 'Deze codelijst kan niet aangepast worden.'
      : 'Pas deze codelijst aan.';
  }

  @action
  editCodelist() {
    this.router.transitionTo('codelijsten.edit', {
      id: this.model.codelijst.id,
    });
  }

  @action
  async deleteCodelist() {
    this.isDeleting = true;
    await this.deleteConcepts();
    this.model.codelijst.deleteRecord();
    this.model.codelijst.save();
    showSuccessToast(
      this.toaster,
      'Codelijst succesvol verwijderd',
      'Codelijst'
    );
    this.router.transitionTo('codelijsten.overzicht');
    this.isDeleting = false;
  }

  async deleteConcepts() {
    await Promise.all(
      this.model.concepten.map(async (concept) => {
        await concept.deleteRecord();
        return concept.save();
      })
    );
  }
}
