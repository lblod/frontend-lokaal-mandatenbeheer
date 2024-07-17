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
import { getDraftPublicationStatus } from 'frontend-lmb/utils/get-mandataris-status';
import { getUniqueBestuursorganen } from 'frontend-lmb/models/mandataris';

export default class MandatarissenPersoonMandatenController extends Controller {
  @service router;
  @service store;
  @service('mandataris') mandatarisService;
  @service('fractie') fractieService;

  queryParams = ['activeOnly'];

  @tracked canBecomeOnafhankelijk;
  @tracked possibelOnafhankelijkeMandatarissen = [];
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
    this.canBecomeOnafhankelijk = false;
    this.possibelOnafhankelijkeMandatarissen = [];
    for (const fold of foldedMandatarissen) {
      const isActive = await this.isMandatarisActive(fold);
      if (!isActive) {
        continue;
      }

      const isOnafhankelijk =
        await this.isFractieOfFoldedMandatarisOnafhankelijk.perform(fold);
      if (!isOnafhankelijk) {
        this.possibelOnafhankelijkeMandatarissen.push(fold.mandataris);
        continue;
      }
    }

    this.canBecomeOnafhankelijk =
      this.possibelOnafhankelijkeMandatarissen.length >= 1;
  });

  wordtOnafhankelijk = task(async () => {
    if (!this.canBecomeOnafhankelijk) {
      return;
    }

    for (const mandataris of this.possibelOnafhankelijkeMandatarissen) {
      const person = await mandataris.isBestuurlijkeAliasVan;
      let onafhankelijkeFractie =
        await this.fractieService.findOnafhankelijkeFractieForPerson(person);

      if (!onafhankelijkeFractie) {
        const bestuursorganenInTijd =
          await getUniqueBestuursorganen(mandataris);
        const bestuurseenheid = await bestuursorganenInTijd[0]?.bestuurseenheid;
        onafhankelijkeFractie =
          await this.fractieService.createOnafhankelijkeFractie(
            bestuursorganenInTijd,
            bestuurseenheid
          );
      }

      await this.mandatarisService.updateOldLidmaatschap(mandataris);
      const dateNow = new Date();
      const overwrites = {
        start: dateNow,
        publicationStatus: await getDraftPublicationStatus(this.store),
        fractie: onafhankelijkeFractie,
      };
      await this.mandatarisService.createFrom(mandataris, overwrites);
      mandataris.einde = dateNow;
      mandataris.save();
    }
  });
}
