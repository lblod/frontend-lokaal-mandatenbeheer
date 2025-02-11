import Component from '@glimmer/component';

import { effectiefIsLastPublicationStatus } from 'frontend-lmb/utils/effectief-is-last-publication-status';
import { isValidUri } from 'frontend-lmb/utils/is-valid-uri';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';

export default class MandaatPublicatieStatusPillComponent extends Component {
  @service toaster;

  @tracked newLink;
  @tracked showEditLinkModal;

  get isMandatarisBekrachtigd() {
    return this.status ? this.status.get('isBekrachtigd') : true;
  }

  get effectiefIsLastStatus() {
    return effectiefIsLastPublicationStatus(this.args.mandataris);
  }

  get status() {
    return this.args.mandataris.publicationStatus;
  }

  async getSkinForPill(statusPromise) {
    const status = await statusPromise;
    if (status.label === 'Bekrachtigd') {
      return 'success';
    }
    if (status.label === 'Effectief') {
      if (await this.effectiefIsLastStatus) {
        return 'success';
      }
      return 'warning';
    }
    if (status.label === 'Draft') {
      return 'border';
    }

    return 'default';
  }

  get skin() {
    return this.getSkinForPill(this.status);
  }

  get invalidLink() {
    return !this.newLink || !isValidUri(this.newLink);
  }

  @action
  updateLink() {
    this.args.mandataris.linkToBesluit = this.newLink;
    this.args.mandataris
      .save()
      .then(() => {
        showSuccessToast(
          this.toaster,
          'De link naar het besluit werd aangepast.'
        );
      })
      .catch((e) => {
        console.error(e);
        showErrorToast(
          this.toaster,
          'Er ging iets mis bij het aanpassen van de link naar het besluit.'
        );
      });
    this.showEditLinkModal = false;
  }

  @action
  editLink() {
    this.newLink = this.args.mandataris.linkToBesluit;
    this.showEditLinkModal = true;
  }

  @action
  onEditLink(e) {
    this.newLink = e.target.value;
  }

  @action
  closeModal() {
    this.showEditLinkModal = false;
  }
}
