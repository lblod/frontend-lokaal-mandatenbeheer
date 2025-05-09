import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { getNietBekrachtigdPublicationStatus } from 'frontend-lmb/utils/get-mandataris-status';

export default class MandatarissenReplacementModal extends Component {
  @tracked replacement;
  @tracked modalOpen = false;

  @service store;
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
    if (replacement?.id === this.args.mandataris.isBestuurlijkeAliasVan.id) {
      this.replacementError = true;
    } else {
      this.replacementError = false;
    }
    this.replacement = replacement;
  }

  @action
  async saveReplacement() {
    const newMandatarisProps = await this.mandatarisService.createNewProps(
      this.args.mandataris,
      {
        start: new Date(),
        rangorde: '',
        publicationStatus: await getNietBekrachtigdPublicationStatus(
          this.store
        ),
      }
    );
    const replacementMandataris =
      await this.mandatarisService.getOrCreateReplacement(
        this.args.mandataris,
        this.replacement,
        newMandatarisProps
      );
    this.args.mandataris.tijdelijkeVervangingen = [replacementMandataris];

    await this.args.mandataris.save();
    this.args.actionWhenAddingReplacement();
  }

  @action
  async cancelReplacement() {
    await this.args.mandataris.rollbackAttributes();
    this.replacement = null;
    this.closeModal();
  }
}
