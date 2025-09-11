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

  get effectiefIsLastStatus() {
    return effectiefIsLastPublicationStatus(this.args.mandataris);
  }

  get status() {
    return (
      this.args.publicationStatus || this.args.mandataris.publicationStatus
    );
  }

  async getSkinForPill(statusPromise) {
    const status = await statusPromise;
    if (status.isBekrachtigd) {
      return 'success';
    }
    if (status.isNietBekrachtigd) {
      if (await this.effectiefIsLastStatus) {
        return 'success';
      }
      return 'warning';
    }
    if (status.isDraft) {
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

  get saveDisabled() {
    return (
      this.invalidLink || this.newLink === this.args.mandataris.linkToBesluit
    );
  }

  get besluitIsAddedThrough() {
    return this.args.mandataris.bekleedt.then(async (mandaat) => {
      if (mandaat.isStrictBurgemeester) {
        return '';
      }

      const how = (await this.args.mandataris?.besluitUri)
        ? 'automatisch'
        : 'handmatig';
      return `Deze mandataris werd ${how} bekrachtigd.`;
    });
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
