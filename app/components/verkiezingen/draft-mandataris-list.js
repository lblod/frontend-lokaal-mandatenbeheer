import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class DraftMandatarisListComponent extends Component {
  @tracked isModalOpen = false;
  @tracked mandataris;

  @action
  openModal(mandataris) {
    this.mandataris = mandataris;
    this.isModalOpen = true;
  }

  @action
  closeModal() {
    this.isModalOpen = false;
    this.mandataris = null;
  }

  @action
  async updatePerson(person) {
    this.mandataris.isBestuurlijkeAliasVan = person;
    await this.mandataris.save();
    this.closeModal();
  }
}
