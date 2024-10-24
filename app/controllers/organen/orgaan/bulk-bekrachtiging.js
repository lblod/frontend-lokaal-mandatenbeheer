import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class BulkBekrachtigingController extends Controller {
  @service mandatarisApi;

  queryParams = ['size', 'page', 'sort'];

  @tracked size = 900000;
  @tracked page = 0;
  @tracked sort = 'is-bestuurlijke-alias-van.achternaam';

  checked = new Set();
  @tracked setSize = 0;
  @tracked allChecked = false;

  @tracked modalOpen = false;

  @action
  openModal() {
    this.modalOpen = true;
  }

  @action
  closeModal() {
    this.modalOpen = false;
  }

  get isDisabled() {
    if (this.setSize == 0) {
      return true;
    }
    return false;
  }

  @action checkBox(mandataris, state) {
    if (state) {
      this.checked.add(mandataris);
      this.setSize += 1;
    } else {
      this.checked.delete(mandataris);
      this.setSize -= 1;
    }
  }

  @action checkAll(state) {
    if (state) {
      this.allChecked = true;
      this.setSize = this.model.mandatarissen.length;
    } else {
      this.allChecked = false;
      this.setSize = 0;
    }
  }

  @action setEffectief() {
    this.mandatarisApi.bulkSetPublicationStatus(
      Array.from(this.checked),
      'effectief'
    );
    this.closeModal();
  }

  @action bekrachtig() {
    this.mandatarisApi.bulkSetPublicationStatus(
      Array.from(this.checked),
      'bekrachtig',
      'www.example.com'
    );
    this.closeModal();
  }
}
