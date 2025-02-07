import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';

import {
  MANDATARIS_BEKRACHTIGD_PUBLICATION_STATE,
  MANDATARIS_EFFECTIEF_PUBLICATION_STATE,
} from 'frontend-lmb/utils/well-known-uris';
import { getDraftPublicationStatus } from 'frontend-lmb/utils/get-mandataris-status';
import { showErrorToast } from 'frontend-lmb/utils/toasts';
import { effectiefIsLastPublicationStatus } from 'frontend-lmb/utils/effectief-is-last-publication-status';
import { PUBLICATION_STATUS_EFFECTIEF_ID } from 'frontend-lmb/utils/well-known-ids';

import { task } from 'ember-concurrency';

export default class MandatarisCardComponent extends Component {
  @tracked editingStatus = false;
  @tracked selectedVervanger;

  @service store;
  @service toaster;
  @service('mandataris') mandatarisService;

  get status() {
    return this.args.mandataris.status.get('label');
  }

  get isBekrachtigd() {
    const statusId = this.args.mandataris.publicationStatus?.get('uri');
    return !statusId || statusId === MANDATARIS_BEKRACHTIGD_PUBLICATION_STATE;
  }

  get isEffectief() {
    const statusId = this.args.mandataris.publicationStatus?.get('uri');
    return !statusId || statusId === MANDATARIS_EFFECTIEF_PUBLICATION_STATE;
  }

  get isEffectiefBurgemeester() {
    return this.isEffectief && this.args.mandataris.isStrictBurgemeester;
  }

  get fractie() {
    return this.args.mandataris.heeftLidmaatschap.get('binnenFractie')
      ? this.args.mandataris.heeftLidmaatschap.get('binnenFractie').get('naam')
      : '';
  }

  get canEditPublicationStatus() {
    return (
      !this.isBekrachtigd &&
      !this.args.disableEdits &&
      !this.isEffectiefBurgemeester
    );
  }

  get persoon() {
    return this.args.mandataris.isBestuurlijkeAliasVan;
  }

  get vervangersDoor() {
    return this.args.mandataris.uniqueVervangersDoor;
  }

  get vervangersVan() {
    return this.args.mandataris.uniqueVervangersVan;
  }

  get effectiefIsLastStatus() {
    return effectiefIsLastPublicationStatus(this.args.mandataris);
  }

  get lastStatusTooltipText() {
    const publicatieStatusId =
      this.args.mandataris.publicationStatus?.get('id');
    if (
      this.effectiefIsLastStatus &&
      publicatieStatusId &&
      publicatieStatusId === PUBLICATION_STATUS_EFFECTIEF_ID
    ) {
      return 'Deze mandataris moet niet bekrachtigd worden.';
    }

    return null;
  }

  @action
  editStatus() {
    this.editingStatus = true;
  }

  @action
  stopEditingStatus() {
    this.editingStatus = false;
  }

  addReplacement = task(async (replacement) => {
    if (replacement.id === this.args.mandataris.isBestuurlijkeAliasVan.id) {
      showErrorToast(
        this.toaster,
        'Je hebt dezelfde persoon geselecteerd als de oorspronkelijke mandataris, het is niet mogelijk een mandataris te laten vervangen door zichzelf.'
      );
      this.selectedVervanger = null;
      return;
    }
    const newMandatarisProps = await this.mandatarisService.createNewProps(
      this.args.mandataris,
      {
        start: new Date(),
        publicationStatus: await getDraftPublicationStatus(this.store),
      }
    );
    const replacementMandataris =
      await this.mandatarisService.getOrCreateReplacement(
        this.args.mandataris,
        replacement,
        newMandatarisProps
      );
    this.args.mandataris.tijdelijkeVervangingen = [replacementMandataris];
    await this.args.mandataris.save();
  });
}
