import Controller from '@ember/controller';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { task } from 'ember-concurrency';
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

  checkFracties = task(async (foldedMandatarissen) => {
    this.canBecomeOnafhankelijk = false;
    this.possibelOnafhankelijkeMandatarissen = [];
    for (const fold of foldedMandatarissen) {
      const isActive = await this.mandatarisService.isMandatarisActive(
        fold.mandataris
      );
      if (!isActive) {
        continue;
      }

      const isOnafhankelijk =
        await this.fractieService.isMandatarisFractieOnafhankelijk(
          fold.mandataris
        );
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
      await this.mandatarisService.createNewFrom(mandataris, overwrites);
      mandataris.einde = dateNow;
      mandataris.save();
    }

    this.router.refresh();
  });
}
