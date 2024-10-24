import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isValidUri } from 'frontend-lmb/utils/is-valid-uri';

export default class BulkBekrachtigingController extends Controller {
  @service mandatarisApi;
  @service router;

  queryParams = ['size', 'page', 'sort'];

  @tracked size = 900000;
  @tracked page = 0;
  @tracked sort = 'is-bestuurlijke-alias-van.achternaam';

  checked = new Set();
  @tracked setSize = 0;
  @tracked allChecked = false;

  @tracked modalOpen = false;

  @tracked status;
  @tracked statusOptions = ['Effectief', 'Bekrachtigd'];

  @tracked linkToBesluit;
  @tracked invalidLink = false;

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

  @action
  updateStatus(status) {
    this.status = status;
  }

  @action
  updateLink(event) {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    const link = event.target.value;

    if (!isValidUri(link)) {
      this.invalidLink = true;
    } else {
      this.invalidLink = false;
    }

    this.linkToBesluit = link;
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

  @action bulkEdit() {
    this.mandatarisApi.bulkSetPublicationStatus(
      Array.from(this.checked),
      this.status,
      this.linkToBesluit
    );
    this.closeModal();
    setTimeout(() => this.router.refresh(), 1000);
  }
}
