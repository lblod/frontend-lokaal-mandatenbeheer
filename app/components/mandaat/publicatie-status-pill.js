import Component from '@glimmer/component';

import { effectiefIsLastPublicationStatus } from 'frontend-lmb/utils/effectief-is-last-publication-status';
import { isValidUri } from 'frontend-lmb/utils/is-valid-uri';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { INPUT_DEBOUNCE } from 'frontend-lmb/utils/constants';
import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';

export default class MandaatPublicatieStatusPillComponent extends Component {
  @service toaster;
  @service mandatarisApi;

  @tracked newLink;
  @tracked showEditLinkModal;
  @tracked isLinkAccessible;

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
    if (!this.newLink || !isValidUri(this.newLink)) {
      return true;
    }
    if (this.onEditLink.isRunning) {
      return false;
    }
    return this.isLinkAccessible === false;
  }

  get invalidLinkErrorMessage() {
    if (!this.invalidLink) {
      return null;
    }

    if (!this.isLinkAccessible && isValidUri(this.newLink)) {
      return 'Deze link is niet bereikbaar. Controleer of de link correct is en of de pagina publiek toegankelijk is.';
    }

    return 'Start de url met http:// of https:// om te linken naar de besluit pagina.';
  }

  get saveDisabled() {
    return (
      this.onEditLink.isRunning ||
      this.invalidLink ||
      this.newLink === this.args.mandataris.linkToBesluit
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
    this.isLinkAccessible = undefined;
    this.showEditLinkModal = true;
  }

  onEditLink = task({ restartable: true }, async (e) => {
    const link = e.target.value;
    this.newLink = link;

    await timeout(INPUT_DEBOUNCE);

    this.isLinkAccessible =
      await this.mandatarisApi.isDecisionLinkAccessible(link);
  });

  @action
  closeModal() {
    this.showEditLinkModal = false;
  }
}
