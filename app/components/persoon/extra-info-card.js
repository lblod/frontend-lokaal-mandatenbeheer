import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class PersoonExtraInfoCard extends Component {
  @service router;

  @tracked formInitialized = false;
  @tracked isModalActive = false;

  @action
  noop() {
    return;
  }
  @action toggleModal() {
    this.isModalActive = !this.isModalActive;
  }
  @action onSave() {
    this.isModalActive = false;
    this.router.refresh();
  }
}
