import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class DraftMandatarisListComponent extends Component {
  @tracked isModalOpen = false;
  @tracked mandataris;
  @tracked editBeleidsdomeinen;

  @action
  openModal(mandataris) {
    this.mandataris = mandataris;
    this.isModalOpen = true;
  }

  @action
  closeModal() {
    this.isModalOpen = false;
  }

  @action
  openEditBeleidsdomeinen(mandataris) {
    this.editBeleidsdomeinen = mandataris.id;
  }

  @action
  async updatePerson(person) {
    this.mandataris.isBestuurlijkeAliasVan = person;
    await this.mandataris.save();
    this.isModalOpen = false;
  }
}
