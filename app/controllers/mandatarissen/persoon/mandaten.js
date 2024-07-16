import Controller from '@ember/controller';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { task } from 'ember-concurrency';
import moment from 'moment';
import {
  MANDATARIS_BEEINDIGD_STATE,
  MANDATARIS_VERHINDERD_STATE,
} from 'frontend-lmb/utils/well-known-uris';

export default class MandatarissenPersoonMandatenController extends Controller {
  @service router;

  queryParams = ['activeOnly'];

  @tracked isBecomeOnafhankelijkDisabled = false;
  @tracked isModalOpen = false;
  @tracked selectedBestuursorgaan = null;
  @tracked activeOnly = true;
  sort = 'is-bestuurlijke-alias-van.achternaam';

  @action
  toggleModal() {
    this.isModalOpen = !this.isModalOpen;
  }

  @action
  closeModal() {
    this.isModalOpen = false;
    this.selectedBestuursorgaan = null;
  }

  @action
  createMandataris() {
    this.toggleModal();
    this.router.transitionTo(
      'organen.orgaan.mandataris.new',
      this.selectedBestuursorgaan.id,
      { queryParams: { person: this.model.persoon.id } }
    );
  }

  @action
  toggleActiveOnly() {
    this.activeOnly = !this.activeOnly;
  }

  isFractieOfFoldedMandatarisOnafhankelijk = task(async (foldedMandataris) => {
    const lid = await foldedMandataris.mandataris.heeftLidmaatschap;
    if (!lid) {
      return true;
    }

    const fractie = await lid.binnenFractie;
    if (fractie) {
      const type = await fractie.fractietype;
      return type ? type.isOnafhankelijk : false;
    }

    return false;
  });

  async isMandatarisActive(foldedMandataris) {
    const now = moment();
    const todayIsInBetweenPeriod =
      moment(foldedMandataris.foldedStart).isBefore(now) &&
      (!foldedMandataris.foldedEnd ||
        moment(foldedMandataris.foldedEnd).isAfter(now));

    if (!todayIsInBetweenPeriod) {
      return false;
    }

    const status = await foldedMandataris.mandataris.status;
    return (
      status &&
      status.uri !== MANDATARIS_VERHINDERD_STATE &&
      status.uri !== MANDATARIS_BEEINDIGD_STATE
    );
  }

  checkFracties = task(async (foldedMandatarissen) => {
    let notAllOnafhankelijk = true;
    for (const fold of foldedMandatarissen) {
      const isActive = await this.isMandatarisActive(fold);
      if (!isActive || !notAllOnafhankelijk) {
        continue;
      }

      const isOnafhankelijk =
        await this.isFractieOfFoldedMandatarisOnafhankelijk.perform(fold);
      if (!isOnafhankelijk) {
        notAllOnafhankelijk = false;
        continue;
      }
    }

    this.isBecomeOnafhankelijkDisabled = notAllOnafhankelijk;
  });

  wordtOnafhankelijk = task(async () => {
    console.log(`Wordt onafhankelijk`);
  });
}
