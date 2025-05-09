import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { getNietBekrachtigdPublicationStatus } from 'frontend-lmb/utils/get-mandataris-status';
import { showErrorToast } from 'frontend-lmb/utils/toasts';

export default class MandatarissenReplacementModal extends Component {
  @tracked replacement;
  @tracked replacementMandataris;
  @tracked modalOpen = false;

  @service store;
  @service toaster;
  @service('mandataris') mandatarisService;

  get vervangersDoor() {
    return this.args.mandataris.uniqueVervangersDoor;
  }

  @action
  openModal() {
    this.modalOpen = true;
  }

  @action
  closeModal() {
    this.modalOpen = false;
  }

  @action
  async selectReplacement(replacement) {
    if (replacement.id === this.args.mandataris.isBestuurlijkeAliasVan.id) {
      showErrorToast(
        this.toaster,
        'Je hebt dezelfde persoon geselecteerd als de oorspronkelijke mandataris, het is niet mogelijk een mandataris te laten vervangen door zichzelf.'
      );
      this.replacement = null;
      return;
    }
    this.replacement = replacement;
    const newMandatarisProps = await this.mandatarisService.createNewProps(
      this.args.mandataris,
      {
        start: new Date(),
        publicationStatus: await getNietBekrachtigdPublicationStatus(
          this.store
        ),
      }
    );
    this.replacementMandataris =
      await this.mandatarisService.getOrCreateReplacement(
        this.args.mandataris,
        replacement,
        newMandatarisProps
      );
    this.args.mandataris.tijdelijkeVervangingen = [this.replacementMandataris];
  }

  @action
  async saveReplacement() {
    await this.args.mandataris.save();
    this.args.actionWhenAddingReplacement();
  }

  @action
  async cancelReplacement() {
    await this.args.mandataris.rollbackAttributes();
    this.replacementMandataris.destroyRecord();
    this.replacement = null;
    this.closeModal();
  }
}
