import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class CustomFormEditablePanel extends Component {
  @service router;

  @tracked formInitialized = false;
  @tracked isModalActive = false;

  @action toggleModal() {
    this.isModalActive = !this.isModalActive;
  }
  @action onSave() {
    this.isModalActive = false;
    if (this.args.onSave) {
      this.args.onSave();
    }
  }
}
