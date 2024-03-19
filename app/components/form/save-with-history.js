import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class SaveWithHistoryComponent extends Component {
  @tracked isModalOpen = false;

  @action
  openModal() {
    if (this.args.showHistory) {
      this.isModalOpen = true;
    } else {
      this.args.save();
    }
  }

  @action
  closeModal() {
    this.isModalOpen = false;
  }

  @action
  confirm() {
    this.isModalOpen = false;
    this.args.save();
  }
}
