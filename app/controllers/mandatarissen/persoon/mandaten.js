import Controller from '@ember/controller';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { task } from 'ember-concurrency';
import { getNietBekrachtigdPublicationStatus } from 'frontend-lmb/utils/get-mandataris-status';
import { showSuccessToast } from 'frontend-lmb/utils/toasts';

import { endOfDay } from 'frontend-lmb/utils/date-manipulation';

export default class MandatarissenPersoonMandatenController extends Controller {
  @service router;
  @service toaster;
  @service store;
  @service('mandataris') mandatarisService;
  @service('fractie') fractieService;
  @service fractieApi;
  @service persoonApi;

  queryParams = ['activeOnly', 'page', 'size', 'sort'];

  @tracked page = 0;
  @tracked size = 20;
  @tracked canBecomeOnafhankelijk;
  @tracked currentNonOnafhankelijkeMandatarissen = [];
  @tracked isIndependentModalOpen = false;
  @tracked isModalOpen = false;
  @tracked isEndMandatesModalOpen = false;
  @tracked selectedBestuursorgaan = null;
  @tracked activeOnly = true;
  @tracked date = new Date();
  sort = 'is-bestuurlijke-alias-van.achternaam';

  @action
  toggleModal() {
    this.isModalOpen = !this.isModalOpen;
  }

  @action
  closeModal() {
    this.isModalOpen = false;
    this.isEndMandatesModalOpen = false;
    this.selectedBestuursorgaan = null;
  }

  @action
  createMandataris() {
    const bestuursorgaan = this.selectedBestuursorgaan;
    this.closeModal();
    this.router.transitionTo(
      'organen.orgaan.mandataris.new',
      bestuursorgaan.id,
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

  becomeOnafhankelijk = task(async () => {
    if (!this.canBecomeOnafhankelijk) {
      return;
    }

    for (const mandataris of this.currentNonOnafhankelijkeMandatarissen) {
      const mandaat = await mandataris.bekleedt;
      const bestuursorgaan = (await mandaat.bevatIn)[0];
      const bestuursperiode = await bestuursorgaan.heeftBestuursperiode;
      const person = await mandataris.isBestuurlijkeAliasVan;

      const onafhankelijkeFractie =
        await this.fractieService.getOrCreateOnafhankelijkeFractie(
          person,
          bestuursperiode,
          this.model.bestuurseenheid
        );
      await onafhankelijkeFractie.save();

      const newMandatarisProps = await this.mandatarisService.createNewProps(
        mandataris,
        {
          start: this.date,
          publicationStatus: await getNietBekrachtigdPublicationStatus(
            this.store
          ),
          fractie: onafhankelijkeFractie,
        }
      );
      const newMandataris = await this.store.createRecord(
        'mandataris',
        newMandatarisProps
      );
      await newMandataris.save();

      await this.mandatarisService.createNewLidmaatschap(
        newMandataris,
        onafhankelijkeFractie
      );
      await this.fractieApi.updateCurrentFractie(newMandataris.id);
      await this.mandatarisService.removeDanglingFractiesInPeriod(
        newMandataris.id
      );

      mandataris.einde = endOfDay(this.date);
      await mandataris.save();
    }

    this.isIndependentModalOpen = false;
    this.router.refresh();
  });

  endActiveMandaten = task(async () => {
    await this.persoonApi.endActiveMandates(
      this.model.persoon.id,
      endOfDay(this.date)
    );
    showSuccessToast(
      this.toaster,
      `Active mandatatarissen beëindigd voor ${this.model.persoon.naam}`
    );
    this.activeOnly = false;
    this.isEndMandatesModalOpen = false;
    this.router.refresh();
  });

  get toolTipText() {
    return 'Deze persoon is reeds onafhankelijk.';
  }

  get endMandatarissenDisabled() {
    return !this.date;
  }
}
