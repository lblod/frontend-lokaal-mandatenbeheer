import Controller from '@ember/controller';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { task } from 'ember-concurrency';
import { getDraftPublicationStatus } from 'frontend-lmb/utils/get-mandataris-status';
import { showSuccessToast } from 'frontend-lmb/utils/toasts';

export default class MandatarissenPersoonMandatenController extends Controller {
  @service router;
  @service toaster;
  @service store;
  @service('mandataris') mandatarisService;
  @service('fractie') fractieService;
  @service fractieApi;
  @service persoonApi;

  queryParams = ['activeOnly'];

  @tracked canBecomeOnafhankelijk;
  @tracked currentNonOnafhankelijkeMandatarissen = [];
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
    this.currentNonOnafhankelijkeMandatarissen = [];
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
        this.currentNonOnafhankelijkeMandatarissen.push(fold.mandataris);
        continue;
      }
    }

    this.canBecomeOnafhankelijk =
      this.currentNonOnafhankelijkeMandatarissen.length >= 1;
  });

  async createOnafhankelijkeFractie(mandataris) {
    const mandaat = await mandataris.bekleedt;
    const mandaatBestuursorganenInTijd = await mandaat.bevatIn;
    const activePeriod =
      await mandaatBestuursorganenInTijd[0].heeftBestuursperiode;
    const bestuursorgaan =
      await mandaatBestuursorganenInTijd[0].isTijdsspecialisatieVan;
    const bestuurseenheid = await bestuursorgaan.bestuurseenheid;
    const bestuursOrganenInTijd = await this.store.query('bestuursorgaan', {
      'filter[is-tijdsspecialisatie-van][bestuurseenheid][:id:]':
        bestuurseenheid.id,
      'filter[heeft-bestuursperiode][:id:]': activePeriod.id,
    });

    return await this.fractieService.createOnafhankelijkeFractie(
      bestuursOrganenInTijd,
      bestuurseenheid
    );
  }

  becomeOnafhankelijk = task(async () => {
    if (!this.canBecomeOnafhankelijk) {
      return;
    }

    for (const mandataris of this.currentNonOnafhankelijkeMandatarissen) {
      const person = await mandataris.isBestuurlijkeAliasVan;
      let onafhankelijkeFractie =
        await this.fractieService.findOnafhankelijkeFractieForPerson(person);

      if (!onafhankelijkeFractie) {
        onafhankelijkeFractie =
          await this.createOnafhankelijkeFractie(mandataris);
      }

      const dateNow = new Date();
      const newMandatarisProps = await this.mandatarisService.createNewProps(
        mandataris,
        {
          start: dateNow,
          publicationStatus: await getDraftPublicationStatus(this.store),
          fractie: onafhankelijkeFractie,
        }
      );
      const newMandataris = await this.store.createRecord(
        'mandataris',
        newMandatarisProps
      );
      await newMandataris.save();

      await this.mandatarisService.updateOldLidmaatschap(mandataris);
      await this.mandatarisService.createNewLidmaatschap(
        newMandataris,
        onafhankelijkeFractie
      );
      await this.fractieApi.updateCurrentFractie(newMandataris.id);
      await this.mandatarisService.removeDanglingFractiesInPeriod(
        newMandataris.id
      );

      mandataris.einde = dateNow;
      await mandataris.save();
    }

    this.router.refresh();
  });

  endActiveMandaten = task(async () => {
    await this.persoonApi.endActiveMandates(this.model.persoon.id);
    showSuccessToast(
      this.toaster,
      `Active mandatatarissen beëindigd voor ${this.model.persoon.naam}`
    );
    this.activeOnly = false;
    this.router.refresh();
  });
}
